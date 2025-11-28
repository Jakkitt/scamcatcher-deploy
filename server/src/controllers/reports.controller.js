import Report from '../models/Report.js';
import User from '../models/User.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';
import { findOrphanReportIds, purgeOrphanReports } from '../services/reportMaintenance.js';
import { createReportRecord, searchReportRecords, sanitizeDescription } from '../services/reports.js';
import { sanitizeSearchQuery } from '../utils/sanitize.js';
import { sendMail } from '../services/mailer.js';
import { buildReportApprovedEmail, buildReportRejectedEmail } from '../services/emailTemplates.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const splitNameParts = (value = '') => {
  const segments = String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!segments.length) return { first: '', last: '' };
  const first = segments.shift() || '';
  const last = segments.join(' ');
  return { first, last };
};

const mapPhotosToPublic = (req, photos = []) => {
  const host = `${req.protocol}://${req.get('host')}`;
  return photos.map((item) => {
    if (!item) return item;
    if (String(item).startsWith('http')) return item;
    const normalized = String(item).startsWith('/') ? item : `/${item}`;
    return `${host}${normalized}`;
  });
};

const serializeReport = (req, doc) => {
  if (!doc) return null;
  const payload = doc.toObject();
  payload.id = doc._id.toString();
  payload.photos = mapPhotosToPublic(req, payload.photos || []);
  const derivedName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim();
  const fallbackName = derivedName || payload.name || '';
  if (!payload.name && fallbackName) {
    payload.name = fallbackName;
  }
  if (!payload.firstName || !payload.lastName) {
    const parts = splitNameParts(payload.name || fallbackName);
    payload.firstName = payload.firstName || parts.first;
    payload.lastName = payload.lastName || parts.last;
  }
  return payload;
};

export async function createReport(req, res) {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    }
    const photos =
      Array.isArray(req.files) && req.files.length > 0
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : [];
    // Sanitize description field to prevent XSS
    if (req.body && typeof req.body.desc === 'string') {
      req.body.desc = sanitizeDescription(req.body.desc);
    }
    // Explicitly destructure to prevent mass assignment
    const { firstName, lastName, name, bank, account, amount, date, category, channel, desc } = req.body;
    const record = await createReportRecord({
      ownerId,
      payload: { firstName, lastName, name, bank, account, amount, date, category, channel, desc },
      photos,
    });
    return res.status(201).json(serializeReport(req, record));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export const searchReports = asyncHandler(async (req, res) => {
  // Fix: Extract fields manually to avoid JSON structure destruction by sanitizeSearchQuery
  const filters = {
    firstName: sanitizeSearchQuery(req.query.firstName),
    lastName: sanitizeSearchQuery(req.query.lastName),
    name: sanitizeSearchQuery(req.query.name),
    bank: sanitizeSearchQuery(req.query.bank),
    account: sanitizeSearchQuery(req.query.account),
    channel: sanitizeSearchQuery(req.query.channel),
    status: 'approved', // Force approved status for public search
  };

  const list = await searchReportRecords(filters);
  return res.json(list.map((doc) => serializeReport(req, doc)));
});

export async function listMyReports(req, res) {
  try {
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error: { message: 'UNAUTHORIZED' } });
    const list = await Report.find({ owner: uid }).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map((r) => serializeReport(req, r)));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function listAllReports(req, res) {
  try {
    const list = await Report.find({}).sort({ createdAt: -1 }).limit(500);
    return res.json(list.map((r) => serializeReport(req, r)));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function listRecentPublic(_req, res) {
  try {
    const list = await Report.find({ status: 'approved' }) // แสดงเฉพาะรายงานที่อนุมัติแล้ว
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const payload = list.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
      bank: doc.bank || '',
      account: doc.account || '',
      status: doc.status || 'pending',
      category: doc.category || '',
      channel: doc.channel || '',
      createdAt: doc.createdAt,
    }));
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function listPublicReports(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100); // max 100
    const list = await Report.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const payload = list.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
      bank: doc.bank || '',
      account: doc.account || '',
      status: doc.status || 'pending',
      category: doc.category || '',
      channel: doc.channel || '',
      createdAt: doc.createdAt,
    }));
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function getReportStats(_req, res) {
  try {
    const aggregation = await Report.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const mapCount = aggregation.reduce((acc, curr) => {
      acc[curr._id || 'unknown'] = curr.count;
      return acc;
    }, {});
    const total = Object.values(mapCount).reduce((sum, val) => sum + val, 0);
    return res.json({
      total,
      pending: mapCount.pending || 0,
      approved: mapCount.approved || 0,
      rejected: mapCount.rejected || 0,
    });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function getFraudCategories(req, res) {
  try {
    const days = Number(req.query.days || 30);
    const match = { status: 'approved' }; // แสดงเฉพาะรายงานที่อนุมัติแล้ว
    if (!Number.isNaN(days) && days > 0) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      match.createdAt = { $gte: since };
    }
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$category', 'ไม่ระบุ'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ];

    const aggregation = await Report.aggregate(pipeline);
    const total = aggregation.reduce((sum, item) => sum + (item.count || 0), 0);
    const items = aggregation.map((item) => ({
      category: item._id || 'ไม่ระบุ',
      count: item.count || 0,
      percent: total ? Math.round(((item.count || 0) / total) * 1000) / 10 : 0,
    }));

    return res.json({ total, items });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function getReportById(req, res) {
  try {
    const doc = await Report.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });
    const role = req.user?.role || 'guest';
    const isAdmin = role === 'admin';
    const isOwner =
      req.user?.id && doc.owner && String(doc.owner) === String(req.user.id);

    if (doc.status !== 'approved' && !isOwner && !isAdmin) {
      return res.status(403).json({ error: { message: 'forbidden' } });
    }
    return res.json(serializeReport(req, doc));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

async function setStatus(id, status){
  const doc = await Report.findById(id);
  if (!doc) return null;
  doc.status = status;
  await doc.save();
  return doc;
}

export async function approveReport(req, res) {
  try {
    const doc = await setStatus(req.params.id, 'approved');
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });

    // Send Email
    if (doc.owner) {
      const user = await User.findById(doc.owner);
      if (user && user.settings?.emailNotifications) {
        const { subject, text, html } = buildReportApprovedEmail({
          username: user.username,
          reportId: doc._id.toString(),
          reportName: doc.name || 'ไม่ระบุชื่อ',
        });
        sendMail({ to: user.email, subject, text, html }).catch(console.error);
      }
    }

    return res.json(serializeReport(req, doc));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function rejectReport(req, res) {
  try {
    const doc = await setStatus(req.params.id, 'rejected');
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });

    // Send Email
    if (doc.owner) {
      const user = await User.findById(doc.owner);
      if (user && user.settings?.emailNotifications) {
        const { subject, text, html } = buildReportRejectedEmail({
          username: user.username,
          reportId: doc._id.toString(),
          reportName: doc.name || 'ไม่ระบุชื่อ',
        });
        sendMail({ to: user.email, subject, text, html }).catch(console.error);
      }
    }

    return res.json(serializeReport(req, doc));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function resetReport(req, res) {
  try {
    const doc = await setStatus(req.params.id, 'pending');
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });
    return res.json(serializeReport(req, doc));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function deleteReport(req, res) {
  try {
    const id = req.params.id;
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });
    const uid = req.user?.id;
    const role = req.user?.role || 'user';
    if (role !== 'admin' && String(doc.owner || '') !== String(uid || '')) {
      return res.status(403).json({ error: { message: 'forbidden' } });
    }
    await doc.deleteOne();
    await deleteUploadsByUrls(doc?.photos || []);
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function countOrphans(_req, res) {
  try {
    const ids = await findOrphanReportIds();
    return res.json({ count: ids.length, ids });
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function purgeOrphans(req, res) {
  try {
    if ((req.user?.role || 'user') !== 'admin') {
      return res.status(403).json({ error: { message: 'forbidden' } });
    }
    const result = await purgeOrphanReports();
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export const __testables = { mapPhotosToPublic, sanitizeDescription };
