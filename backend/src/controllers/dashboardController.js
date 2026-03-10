const { RTIApplication } = require('../models/RTIApplication');
const { Stage } = require('../models/Stage');
const asyncHandler = require('../utils/asyncHandler');
const { computeDeadlines, getDeadlineStatus } = require('../utils/deadline');

const getDashboardStats = asyncHandler(async (_req, res) => {
  const all = await RTIApplication.find({}).lean();
  const allIds = all.map((rti) => rti._id);
  const caseClosedStages = await Stage.find({
    rtiId: { $in: allIds },
    stageName: 'Case Closed'
  })
    .select('rtiId')
    .lean();
  const closedStageIds = new Set(caseClosedStages.map((item) => String(item.rtiId)));

  const total = all.length;
  const pendingPio = all.filter(
    (rti) => rti.status === 'RTI Filed' && !closedStageIds.has(String(rti._id))
  ).length;
  const firstAppeals = all.filter((rti) => rti.status === 'First Appeal Filed' || rti.status === 'First Appeal Order Received').length;
  const secondAppeals = all.filter((rti) => rti.status.startsWith('Second Appeal')).length;
  const closed = all.filter(
    (rti) =>
      rti.status === 'Case Closed' || rti.status === 'Closed' || closedStageIds.has(String(rti._id))
  ).length;

  let overdue = 0;
  const upcomingDeadlines = [];

  for (const rti of all) {
    const [firstAppealOrder, latestStage] = await Promise.all([
      Stage.findOne({
        rtiId: rti._id,
        stageName: 'First Appeal Order Received'
      }).sort({ stageDate: -1 }),
      Stage.findOne({
        rtiId: rti._id
      }).sort({ stageDate: -1, updatedAt: -1 })
    ]);

    const deadlines = computeDeadlines({
      applicationDate: rti.applicationDate,
      latestStageDate: latestStage?.stageDate,
      firstAppealOrderDate: firstAppealOrder?.stageDate
    });
    const isClosed =
      rti.status === 'Case Closed' || rti.status === 'Closed' || closedStageIds.has(String(rti._id));
    const pioStatus = isClosed ? 'na' : getDeadlineStatus(deadlines.pioDeadline);

    if (pioStatus === 'overdue' && rti.status === 'RTI Filed') {
      overdue += 1;
    }

    if (pioStatus !== 'overdue' && pioStatus !== 'na' && rti.status === 'RTI Filed') {
      upcomingDeadlines.push({
        rtiId: rti._id,
        rtiNumber: rti.rtiNumber,
        department: rti.department,
        deadlineType: 'PIO Response Deadline',
        deadlineDate: deadlines.pioDeadline,
        status: pioStatus
      });
    }
  }

  const filedPerYear = await RTIApplication.aggregate([
    {
      $group: {
        _id: { $year: '$applicationDate' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const byDepartment = await RTIApplication.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const successVsPending = [
    { name: 'Closed', value: closed },
    { name: 'Pending', value: total - closed }
  ];

  res.json({
    cards: {
      totalRtis: total,
      pendingPioResponses: pendingPio,
      firstAppealsFiled: firstAppeals,
      secondAppealsFiled: secondAppeals,
      closedRtis: closed,
      overdueRtis: overdue
    },
    charts: {
      filedPerYear: filedPerYear.map((item) => ({ year: String(item._id), count: item.count })),
      byDepartment: byDepartment.map((item) => ({ department: item._id, count: item.count })),
      successVsPending
    },
    upcomingDeadlines: upcomingDeadlines.sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate)).slice(0, 10)
  });
});

module.exports = {
  getDashboardStats
};
