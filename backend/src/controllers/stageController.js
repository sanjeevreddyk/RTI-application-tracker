const { Stage } = require('../models/Stage');
const { RTIApplication } = require('../models/RTIApplication');
const asyncHandler = require('../utils/asyncHandler');

const createStage = asyncHandler(async (req, res) => {
  const { rtiId, stageName, stageDate, description } = req.body;

  const rti = await RTIApplication.findById(rtiId);
  if (!rti) {
    res.status(404);
    throw new Error('RTI not found');
  }

  const stage = await Stage.create({ rtiId, stageName, stageDate, description });

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
  const stages = await Stage.find({ rtiId: req.params.rtiId }).sort({ stageDate: 1 });
  res.json(stages);
});

module.exports = {
  createStage,
  getStagesByRti
};