const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { destroyByPublicId, isConfigured, uploadBuffer } = require('../config/cloudinary');

function getResourceType(mimeType) {
  return String(mimeType || '').startsWith('image/') ? 'image' : 'raw';
}

function extensionFromMime(mimeType) {
  const map = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp'
  };
  return map[mimeType] || '';
}

function withExtension(fileName, mimeType) {
  const name = String(fileName || '').trim();
  const ext = path.extname(name);
  if (ext) {
    return name;
  }

  const mimeExt = extensionFromMime(mimeType);
  return mimeExt ? `${name || 'document'}${mimeExt}` : name || 'document';
}

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

  if (!isConfigured()) {
    res.status(500);
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_URL or cloudinary key env vars.');
  }

  const normalizedStageName = (stageName || 'General').trim();
  const safeStageFolder = normalizedStageName.replace(/[^a-zA-Z0-9-_]/g, '_');

  const uploadResults = await Promise.all(
    req.files.map((file) =>
      uploadBuffer(file, {
        folder: `rti-documents/${rtiId}/${safeStageFolder}`,
        resource_type: getResourceType(file.mimetype)
      })
    )
  );

  const docs = uploadResults.map((result, index) => ({
    rtiId,
    stageId: stageId || null,
    stageName: normalizedStageName,
    fileName: withExtension(req.files[index].originalname, req.files[index].mimetype),
    filePath: result.secure_url,
    fileType: req.files[index].mimetype,
    cloudinaryPublicId: result.public_id,
    cloudinaryResourceType: result.resource_type || getResourceType(req.files[index].mimetype),
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

  if (doc.cloudinaryPublicId) {
    try {
      await destroyByPublicId(doc.cloudinaryPublicId, doc.cloudinaryResourceType || 'image');
    } catch (_error) {
      // do not block delete in DB if remote cleanup fails
    }
  } else {
    const absolutePath = path.join(process.cwd(), String(doc.filePath || '').replace(/^\//, ''));
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
});

module.exports = {
  uploadDocuments,
  getDocumentsByRti,
  deleteDocument
};
