import Report from '../models/Report.js';

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
    const list = await Report.find({ owner: req.user?.id }).sort({ createdAt: -1 }).limit(200);
    return res.json(list.map(r => ({ id: r._id.toString(), ...r.toObject() })));
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}
