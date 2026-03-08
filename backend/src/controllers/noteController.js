const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');

const createNote = asyncHandler(async (req, res) => {
  const { rtiId, noteText, author } = req.body;

  if (!rtiId || !noteText) {
    res.status(400);
    throw new Error('rtiId and noteText are required');
  }

  const note = await Note.create({ rtiId, noteText, author });
  res.status(201).json(note);
});

const getNotesByRti = asyncHandler(async (req, res) => {
  const notes = await Note.find({ rtiId: req.params.rtiId }).sort({ createdAt: -1 });
  res.json(notes);
});

module.exports = {
  createNote,
  getNotesByRti
};