const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const { destroyByPublicId, isConfigured, uploadBuffer } = require('../config/cloudinary');

function getResourceType(mimeType) {
  const type = String(mimeType || '');
  if (type.startsWith('image/')) {
    return 'image';
  }

  return 'raw';
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

function sanitizeForPublicId(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

function buildPublicId(fileName, mimeType, resourceType) {
  const normalized = withExtension(fileName, mimeType);
  const parsed = path.parse(normalized);
  const base = sanitizeForPublicId(parsed.name) || 'document';
  const ext = (parsed.ext || extensionFromMime(mimeType) || '').toLowerCase();
  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

  // For raw assets, extension should be part of public_id so delivery URL preserves it.
  // For image assets (including PDFs uploaded as image), Cloudinary appends format automatically.
  if (resourceType === 'raw') {
    return ext ? `${base}-${suffix}${ext}` : `${base}-${suffix}`;
  }

  return `${base}-${suffix}`;
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
    req.files.map((file) => {
      const resourceType = getResourceType(file.mimetype);
      return uploadBuffer(file, {
        folder: `rti-documents/${rtiId}/${safeStageFolder}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: false,
        public_id: buildPublicId(file.originalname, file.mimetype, resourceType)
      })
    })
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
