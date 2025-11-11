export function ensureAtLeastOnePhoto(req, res, next){
  try{
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length < 1){
      return res.status(400).json({ error:{ code:'VALIDATION_ERROR', message:'ข้อมูลไม่ถูกต้อง', fields:{ photos:'min_1' } } });
    }
    next();
  }catch{
    return res.status(400).json({ error:{ code:'VALIDATION_ERROR', message:'ข้อมูลไม่ถูกต้อง', fields:{ photos:'min_1' } } });
  }
}

