const multer = require('multer');

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Unsupported file type. Allowed: PDF, DOC, DOCX, Images'));
      return;
    }

    cb(null, true);
  }
});

module.exports = upload;