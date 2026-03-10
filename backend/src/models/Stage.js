const mongoose = require('mongoose');

const STAGE_NAMES = [
  'RTI Filed',
  'PIO Response Received',
  'First Appeal Filed',
  'First Appeal Order Received',
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order',
  'Case Closed'
];

const stageSchema = new mongoose.Schema(
  {
    rtiId: { type: mongoose.Schema.Types.ObjectId, ref: 'RTIApplication', required: true, index: true },
    stageName: { type: String, enum: STAGE_NAMES, required: true },
    stageDate: { type: Date, required: true },
    description: { type: String, trim: true },
    postalTrackingNumber: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = {
  STAGE_NAMES,
  Stage: mongoose.model('Stage', stageSchema)
};
