import Report from '../models/Report.js';
import User from '../models/User.js';
import sanitizeHtml from 'sanitize-html';
import { resolveUploadPathFromUrl, deleteUploadsByUrls } from '../utils/uploads.js';

const sanitizeDescription = (value = '') =>
  sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

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
  return payload;
};

export async function createReport(req, res){
  try{
    const owner = req.user?.id || null;
    const payload = { ...req.body, owner };
    payload.desc = sanitizeDescription(payload.desc || '');
    // If files uploaded, map to public URLs
    if (Array.isArray(req.files) && req.files.length > 0){
      payload.photos = req.files.map(f => `/uploads/${f.filename}`);
    }
    const rec = await Report.create(payload);
    return res.status(201).json(serializeReport(req, rec));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function searchReports(req, res){
  try{
    const { name = '', account = '', bank = '', channel = '' } = req.query || {};
    const cond = {};
    if (name) cond.name = { $regex: String(name), $options: 'i' };
    if (account) cond.account = { $regex: String(account), $options: 'i' };
    if (bank) cond.bank = String(bank);
    if (channel) cond.channel = { $regex: String(channel), $options: 'i' };
    const list = await Report.find(cond).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map(r => serializeReport(req, r)));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function listMyReports(req, res){
  try{
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error:{ message:'UNAUTHORIZED' } });
    const list = await Report.find({ owner: uid }).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map(r => serializeReport(req, r)));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function listAllReports(req, res){
  try{
    const list = await Report.find({}).sort({ createdAt: -1 }).limit(500);
    return res.json(list.map(r => serializeReport(req, r)));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function getReportById(req, res){
  try{
    const doc = await Report.findById(req.params.id);
    if (!doc) return res.status(404).json({ error:{ message:'not found' } });
    return res.json(serializeReport(req, doc));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

async function setStatus(id, status){
  const doc = await Report.findById(id);
  if (!doc) return null;
  doc.status = status;
  await doc.save();
  return doc;
}

export async function approveReport(req, res){
  try{
    const doc = await setStatus(req.params.id, 'approved');
    if (!doc) return res.status(404).json({ error:{ message:'not found' } });
    return res.json(serializeReport(req, doc));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function rejectReport(req, res){
  try{
    const doc = await setStatus(req.params.id, 'rejected');
    if (!doc) return res.status(404).json({ error:{ message:'not found' } });
    return res.json(serializeReport(req, doc));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function resetReport(req, res){
  try{
    const doc = await setStatus(req.params.id, 'pending');
    if (!doc) return res.status(404).json({ error:{ message:'not found' } });
    return res.json(serializeReport(req, doc));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function deleteReport(req, res){
  try{
    const id = req.params.id;
    const doc = await Report.findById(id);
    if (!doc) return res.status(404).json({ error:{ message: 'not found' } });
    const uid = req.user?.id;
    const role = req.user?.role || 'user';
    if (role !== 'admin' && String(doc.owner || '') !== String(uid || '')){
      return res.status(403).json({ error:{ message:'forbidden' } });
    }
    await doc.deleteOne();
    await deleteUploadsByUrls(doc?.photos || []);
    return res.status(204).end();
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

// Utilities to find orphan report ids (no owner or owner not exists)
async function getOrphanReportIds(){
  const rows = await Report.aggregate([
    { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'u' } },
    { $match: { $or: [
      { owner: { $exists: false } },
      { owner: null },
      { $expr: { $eq: [ { $size: '$u' }, 0 ] } },
    ] } },
    { $project: { _id: 1 } }
  ]);
  return rows.map(r => r._id);
}

export async function countOrphans(_req, res){
  try{
    const ids = await getOrphanReportIds();
    return res.json({ count: ids.length, ids });
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function purgeOrphans(req, res){
  try{
    if ((req.user?.role || 'user') !== 'admin'){
      return res.status(403).json({ error:{ message:'forbidden' } });
    }
    const ids = await getOrphanReportIds();
    if (ids.length === 0) return res.json({ deleted: 0, ids: [] });
    const docs = await Report.find({ _id: { $in: ids } }, { photos: 1 }).lean();
    const r = await Report.deleteMany({ _id: { $in: ids } });
    await Promise.all(docs.map((doc) => deleteUploadsByUrls(doc?.photos || [])));
    return res.json({ deleted: r.deletedCount || 0, ids });
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export const __testables = { mapPhotosToPublic, sanitizeDescription };
