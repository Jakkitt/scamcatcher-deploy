import User from '../models/User.js';
import Report from '../models/Report.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';

export async function listUsers(req, res){
  try{
    const users = await User.find({}).sort({ createdAt: -1 }).limit(500);
    const counts = await Report.aggregate([
      { $group: { _id: '$owner', c: { $sum: 1 } } }
    ]);
    const mapCount = new Map(counts.map(r => [String(r._id), r.c]));
    const data = users.map(u => ({
      id: u._id.toString(),
      email: u.email,
      username: u.username || '',
      role: u.role || 'user',
      suspended: !!u.suspended,
      joinedAt: u.createdAt,
      reports: mapCount.get(u._id.toString()) || 0,
    }));
    return res.json(data);
  }catch(e){
    return res.status(500).json({ error:{ message: e.message } });
  }
}

export async function suspendUser(req, res){
  try{
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error:{ message:'not found' } });
    // ป้องกันระงับแอดมินหรือระงับตัวเอง
    if (u.role === 'admin' || String(u._id) === String(req.user.id)){
      return res.status(403).json({ error:{ message:'forbidden' } });
    }
    u.suspended = true;
    await u.save();
    return res.json({ ok:true });
  }catch(e){ return res.status(500).json({ error:{ message:e.message } }); }
}

export async function unsuspendUser(req, res){
  try{
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error:{ message:'not found' } });
    if (u.role === 'admin' || String(u._id) === String(req.user.id)){
      return res.status(403).json({ error:{ message:'forbidden' } });
    }
    u.suspended = false;
    await u.save();
    return res.json({ ok:true });
  }catch(e){ return res.status(500).json({ error:{ message:e.message } }); }
}

export async function deleteUserAdmin(req, res){
  try{
    const id = req.params.id;
    const u = await User.findById(id);
    if (!u) return res.status(404).json({ error:{ message:'not found' } });
    if (u.role === 'admin' || String(u._id) === String(req.user.id)){
      return res.status(403).json({ error:{ message:'forbidden' } });
    }
    const ownedReports = await Report.find({ owner: id }, { photos: 1 }).lean();
    await Report.deleteMany({ owner: id });
    await Promise.all(ownedReports.map((doc) => deleteUploadsByUrls(doc?.photos || [])));
    await User.findByIdAndDelete(id);
    return res.status(204).end();
  }catch(e){ return res.status(500).json({ error:{ message:e.message } }); }
}
