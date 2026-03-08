const express = require('express');
const { exportCsv, exportPdf } = require('../controllers/exportController');

const router = express.Router();

router.get('/csv', exportCsv);
router.get('/pdf', exportPdf);

module.exports = router;