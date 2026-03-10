const { Stage } = require('../models/Stage');
const { RTIApplication } = require('../models/RTIApplication');
const asyncHandler = require('../utils/asyncHandler');

const createStage = asyncHandler(async (req, res) => {
  const {
    rtiId,
    stageName,
    stageDate,
    description,
    postalTrackingNumber,
    firstAppealAuthority,
    secondAppealAuthority
  } = req.body;

  const rti = await RTIApplication.findById(rtiId);
  if (!rti) {
    res.status(404);
    throw new Error('RTI not found');
  }

  if (!stageDate) {
    res.status(400);
    throw new Error('stageDate is required');
  }

  // Keep one record per stage name for each RTI case so edited dates overwrite old values.
  const stage = await Stage.findOneAndUpdate(
    { rtiId, stageName },
    {
      stageDate,
      description,
      postalTrackingNumber: postalTrackingNumber || '',
      firstAppealAuthority: stageName === 'First Appeal Filed' ? firstAppealAuthority || '' : '',
      secondAppealAuthority: stageName === 'Second Appeal Filed' ? secondAppealAuthority || '' : ''
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true, sort: { updatedAt: -1 } }
  );

  const stageToStatusMap = {
    'RTI Filed': 'RTI Filed',
    'PIO Response Received': 'PIO Response Received',
    'First Appeal Filed': 'First Appeal Filed',
    'First Appeal Order Received': 'First Appeal Order Received',
    'Second Appeal Filed': 'Second Appeal Filed',
    'Second Appeal Hearing': 'Second Appeal Hearing',
    'Second Appeal Order': 'Second Appeal Order',
    'Case Closed': 'Case Closed'
  };

  if (stageToStatusMap[stageName]) {
    rti.status = stageToStatusMap[stageName];
    await rti.save();
  }

  res.status(201).json(stage);
});

const getStagesByRti = asyncHandler(async (req, res) => {
  const stages = await Stage.find({ rtiId: req.params.rtiId }).lean();
  const latestByStage = new Map();

  stages.forEach((stage) => {
    const key = stage.stageName;
    const existing = latestByStage.get(key);
    const currentUpdatedAt = new Date(stage.updatedAt || stage.createdAt || 0).getTime();
    const existingUpdatedAt = existing
      ? new Date(existing.updatedAt || existing.createdAt || 0).getTime()
      : -1;

    if (!existing || currentUpdatedAt >= existingUpdatedAt) {
      latestByStage.set(key, stage);
    }
  });

  const dedupedStages = Array.from(latestByStage.values()).sort(
    (a, b) => new Date(a.stageDate).getTime() - new Date(b.stageDate).getTime()
  );

  res.json(dedupedStages);
});

module.exports = {
  createStage,
  getStagesByRti
};
