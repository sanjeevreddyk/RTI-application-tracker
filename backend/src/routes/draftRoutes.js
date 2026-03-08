const express = require('express');
const { generateDraft } = require('../controllers/draftController');

const router = express.Router();

router.get('/:type/:rtiId', generateDraft);

module.exports = router;