const { RTIApplication } = require('../models/RTIApplication');
const { Stage } = require('../models/Stage');
const asyncHandler = require('../utils/asyncHandler');

const getAnalytics = asyncHandler(async (_req, res) => {
  const departmentsDelay = await RTIApplication.aggregate([
    { $match: { status: { $in: ['RTI Filed', 'First Appeal Filed', 'Second Appeal Filed'] } } },
    { $group: { _id: '$department', delayedCases: { $sum: 1 } } },
    { $sort: { delayedCases: -1 } },
    { $limit: 10 }
  ]);

  const responseDurations = await Stage.aggregate([
    { $match: { stageName: 'PIO Response Received' } },
    {
      $lookup: {
        from: 'rtiapplications',
        localField: 'rtiId',
        foreignField: '_id',
        as: 'rti'
      }
    },
    { $unwind: '$rti' },
    {
      $project: {
        durationDays: {
          $divide: [{ $subtract: ['$stageDate', '$rti.applicationDate'] }, 1000 * 60 * 60 * 24]
        }
      }
    }
  ]);

  const avgResponseTime = responseDurations.length
    ? Number(
        (
          responseDurations.reduce((sum, item) => sum + item.durationDays, 0) /
          responseDurations.length
        ).toFixed(2)
      )
    : 0;

  const total = await RTIApplication.countDocuments();
  const closed = await RTIApplication.countDocuments({ status: 'Case Closed' });
  const appealSuccessRate = total === 0 ? 0 : Number(((closed / total) * 100).toFixed(2));

  const byYear = await RTIApplication.aggregate([
    { $group: { _id: { $year: '$applicationDate' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    departmentsDelay: departmentsDelay.map((item) => ({ department: item._id, delayedCases: item.delayedCases })),
    averageResponseTime: avgResponseTime,
    appealSuccessRate,
    rtisFiledPerYear: byYear.map((item) => ({ year: String(item._id), count: item.count }))
  });
});

module.exports = {
  getAnalytics
};