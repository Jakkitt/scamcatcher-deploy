import Report from '../models/Report.js';
import User from '../models/User.js';

export async function createReport(req, res){
  try{
    const owner = req.user?.id || null;
    const payload = { ...req.body, owner };
    // If files uploaded, map to public URLs
    if (Array.isArray(req.files) && req.files.length > 0){
      const host = `${req.protocol}://${req.get('host')}`;
      payload.photos = req.files.map(f => `${host}/uploads/${f.filename}`);
    }
    const rec = await Report.create(payload);
    return res.status(201).json({ id: rec._id.toString(), ...rec.toObject() });
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function searchReports(req, res){
  try{
    const { name = '', account = '', bank = '' } = req.query || {};
    const cond = {};
    if (name) cond.name = { $regex: String(name), $options: 'i' };
    if (account) cond.account = { $regex: String(account), $options: 'i' };
    if (bank) cond.bank = String(bank);
    const list = await Report.find(cond).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map(r => ({ id: r._id.toString(), ...r.toObject() })));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function listMyReports(req, res){
  try{
    const uid = req.user?.id;
    if (!uid) return res.status(401).json({ error:{ message:'UNAUTHORIZED' } });
    const list = await Report.find({ owner: uid }).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map(r => ({ id: r._id.toString(), ...r.toObject() })));
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
    const r = await Report.deleteMany({ _id: { $in: ids } });
    return res.json({ deleted: r.deletedCount || 0, ids });
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}
