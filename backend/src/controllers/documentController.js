const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');

const uploadDocuments = asyncHandler(async (req, res) => {
  const { rtiId, stageId, stageName } = req.body;

  if (!rtiId) {
    res.status(400);
    throw new Error('rtiId is required');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('At least one file is required');
  }

  const docs = req.files.map((file) => ({
    rtiId,
    stageId: stageId || null,
    stageName: stageName || 'General',
    fileName: file.originalname,
    filePath: `/uploads/${file.filename}`,
    fileType: file.mimetype,
    uploadDate: new Date()
  }));

  const saved = await Document.insertMany(docs);
  res.status(201).json(saved);
});

const getDocumentsByRti = asyncHandler(async (req, res) => {
  const docs = await Document.find({ rtiId: req.params.rtiId }).sort({ uploadDate: -1 });
  res.json(docs);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);

  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }

  const absolutePath = path.join(process.cwd(), doc.filePath.replace(/^\//, ''));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
});

module.exports = {
  uploadDocuments,
  getDocumentsByRti,
  deleteDocument
};