import Report from '../models/Report.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';
import { findOrphanReportIds, purgeOrphanReports } from '../services/reportMaintenance.js';
import { createReportRecord, searchReportRecords, sanitizeDescription } from '../services/reports.js';

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
    const record = await createReportRecord({
      ownerId,
      payload: req.body,
      photos,
    });
    return res.status(201).json(serializeReport(req, record));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function searchReports(req, res) {
  try {
    const list = await searchReportRecords(req.query || {});
    return res.json(list.map((doc) => serializeReport(req, doc)));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

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

export async function getReportById(req, res) {
  try {
    const doc = await Report.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });
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
    return res.json(serializeReport(req, doc));
  } catch (e) {
    return res.status(500).json({ error: { message: e.message } });
  }
}

export async function rejectReport(req, res) {
  try {
    const doc = await setStatus(req.params.id, 'rejected');
    if (!doc) return res.status(404).json({ error: { message: 'not found' } });
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
