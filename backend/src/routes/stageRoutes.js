const express = require('express');
const { createStage, getStagesByRti } = require('../controllers/stageController');

const router = express.Router();

router.post('/', createStage);
router.get('/:rtiId', getStagesByRti);

module.exports = router;