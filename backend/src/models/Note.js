const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    rtiId: { type: mongoose.Schema.Types.ObjectId, ref: 'RTIApplication', required: true, index: true },
    noteText: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: 'System User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);