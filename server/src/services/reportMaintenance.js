import Report from '../models/Report.js';
import { deleteUploadsByUrls } from '../utils/uploads.js';

export async function findOrphanReportIds() {
  const rows = await Report.aggregate([
    { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'u' } },
    {
      $match: {
        $or: [
          { owner: { $exists: false } },
          { owner: null },
          { $expr: { $eq: [{ $size: '$u' }, 0] } },
        ],
      },
    },
    { $project: { _id: 1 } },
  ]);
  return rows.map((row) => row._id);
}

export async function purgeOrphanReports() {
  const ids = await findOrphanReportIds();
  if (!ids.length) return { deleted: 0, ids };
  const docs = await Report.find({ _id: { $in: ids } }, { photos: 1 }).lean();
  const result = await Report.deleteMany({ _id: { $in: ids } });
  await Promise.all(docs.map((doc) => deleteUploadsByUrls(doc?.photos || [])));
  return { deleted: result.deletedCount || 0, ids };
}
