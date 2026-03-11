const { RTIApplication } = require('../models/RTIApplication');
const { Stage } = require('../models/Stage');
const asyncHandler = require('../utils/asyncHandler');
const { computeDeadlines, getDeadlineStatus, getReminderRule } = require('../utils/deadline');

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
  let pendingPio = 0;
  let firstAppeals = 0;
  let secondAppeals = 0;
  let closed = 0;

  let overdue = 0;
  const upcomingDeadlines = [];
  const reminderRules = {
    t7: 0,
    t3: 0,
    t1: 0,
    overdue: 0
  };

  for (const rti of all) {
    const [firstAppealFiledStage, secondAppealFiledStage, latestStage] = await Promise.all([
      Stage.findOne({
        rtiId: rti._id,
        stageName: 'First Appeal Filed'
      }).sort({ stageDate: -1 }),
      Stage.findOne({
        rtiId: rti._id,
        stageName: 'Second Appeal Filed'
      }).sort({ stageDate: -1 }),
      Stage.findOne({
        rtiId: rti._id
      }).sort({ stageDate: -1, updatedAt: -1 })
    ]);

    const deadlines = computeDeadlines({
      applicationDate: rti.applicationDate,
      firstAppealFiledDate: firstAppealFiledStage?.stageDate,
      secondAppealFiledDate: secondAppealFiledStage?.stageDate
    });
    const isClosed =
      rti.status === 'Case Closed' || rti.status === 'Closed' || closedStageIds.has(String(rti._id));
    const effectiveStatus = isClosed ? 'Case Closed' : latestStage?.stageName || rti.status;

    if (effectiveStatus === 'Case Closed') {
      closed += 1;
    }
    if (effectiveStatus === 'RTI Filed') {
      pendingPio += 1;
    }
    if (effectiveStatus === 'First Appeal Filed' || effectiveStatus === 'First Appeal Order Received') {
      firstAppeals += 1;
    }
    if (String(effectiveStatus || '').startsWith('Second Appeal')) {
      secondAppeals += 1;
    }

    const pioStatus = isClosed ? 'na' : getDeadlineStatus(deadlines.pioDeadline);
    const reminderRule = isClosed ? null : getReminderRule(deadlines.pioDeadline);

    if (reminderRule === 'Overdue' && effectiveStatus === 'RTI Filed') {
      overdue += 1;
      reminderRules.overdue += 1;
    }

    if (reminderRule === 'T-7') {
      reminderRules.t7 += 1;
    }
    if (reminderRule === 'T-3') {
      reminderRules.t3 += 1;
    }
    if (reminderRule === 'T-1') {
      reminderRules.t1 += 1;
    }

    if (reminderRule && effectiveStatus === 'RTI Filed') {
      upcomingDeadlines.push({
        rtiId: rti._id,
        rtiNumber: rti.rtiNumber,
        department: rti.department,
        applicationDate: rti.applicationDate,
        deadlineType: 'PIO Response Deadline',
        deadlineDate: deadlines.pioDeadline,
        status: effectiveStatus,
        reminderRule
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
      overdueRtis: overdue,
      reminders: reminderRules
    },
    charts: {
      filedPerYear: filedPerYear.map((item) => ({ year: String(item._id), count: item.count })),
      byDepartment: byDepartment.map((item) => ({ department: item._id, count: item.count })),
      successVsPending
    },
    upcomingDeadlines: upcomingDeadlines
      .sort((a, b) => new Date(a.deadlineDate) - new Date(b.deadlineDate))
      .slice(0, 10)
  });
});

module.exports = {
  getDashboardStats
};
