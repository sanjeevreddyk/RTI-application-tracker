const express = require('express');
const upload = require('../middleware/upload');
const { uploadDocuments, getDocumentsByRti, deleteDocument } = require('../controllers/documentController');

const router = express.Router();

router.post('/upload', upload.array('files', 10), uploadDocuments);
router.get('/:rtiId', getDocumentsByRti);
router.delete('/:id', deleteDocument);

module.exports = router;