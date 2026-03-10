const mongoose = require('mongoose');

const RTI_STATUS = [
  'RTI Filed',
  'PIO Response Received',
  'First Appeal Filed',
  'First Appeal Order Received',
  'Second Appeal Filed',
  'Second Appeal Hearing',
  'Second Appeal Order',
  'Case Closed'
];

const rtiApplicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true, trim: true },
    applicantAddress: { type: String, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    pioName: { type: String, trim: true },
    pioAddress: { type: String, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    rtiNumber: { type: String, required: true, trim: true, unique: true, index: true },
    applicationDate: { type: Date, required: true },
    modeOfFiling: {
      type: String,
      enum: ['Online', 'Speed Post', 'Registered Post', 'Hand Submission'],
      required: true
    },
    postalTrackingNumber: { type: String, trim: true },
    applicationFee: { type: Number, default: 0 },
    remarks: { type: String, trim: true },
    status: { type: String, enum: RTI_STATUS, default: 'RTI Filed', index: true }
  },
  { timestamps: true }
);

module.exports = {
  RTI_STATUS,
  RTIApplication: mongoose.model('RTIApplication', rtiApplicationSchema)
};
