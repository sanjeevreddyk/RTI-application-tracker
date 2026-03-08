const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    rtiId: { type: mongoose.Schema.Types.ObjectId, ref: 'RTIApplication', required: true, index: true },
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage', default: null },
    stageName: { type: String, trim: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);