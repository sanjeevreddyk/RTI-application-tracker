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
    firstAppealAuthorityAddress,
    secondAppealAuthority,
    secondAppealAuthorityAddress,
    closeCaseSatisfied
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
      firstAppealAuthorityAddress:
        stageName === 'First Appeal Filed' ? firstAppealAuthorityAddress || '' : '',
      secondAppealAuthority: stageName === 'Second Appeal Filed' ? secondAppealAuthority || '' : '',
      secondAppealAuthorityAddress:
        stageName === 'Second Appeal Filed' ? secondAppealAuthorityAddress || '' : ''
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

  if (stageName === 'PIO Response Received' && Boolean(closeCaseSatisfied)) {
    await Stage.findOneAndUpdate(
      { rtiId, stageName: 'Case Closed' },
      {
        stageDate,
        description: 'Case closed as applicant is satisfied with PIO response',
        postalTrackingNumber: '',
        firstAppealAuthority: '',
        firstAppealAuthorityAddress: '',
        secondAppealAuthority: '',
        secondAppealAuthorityAddress: ''
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    rti.status = 'Case Closed';
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

const updateStageByName = asyncHandler(async (req, res) => {
  const { rtiId, stageName } = req.params;
  const { stageDate } = req.body;

  if (!stageDate) {
    res.status(400);
    throw new Error('stageDate is required');
  }

  const rti = await RTIApplication.findById(rtiId);
  if (!rti) {
    res.status(404);
    throw new Error('RTI not found');
  }

  const stage = await Stage.findOneAndUpdate(
    { rtiId, stageName },
    { stageDate: new Date(stageDate) },
    { new: true, runValidators: true }
  );

  if (!stage) {
    res.status(404);
    throw new Error('Stage not found');
  }

  res.json(stage);
});

module.exports = {
  createStage,
  getStagesByRti,
  updateStageByName
};
