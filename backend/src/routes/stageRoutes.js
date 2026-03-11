const express = require('express');
const { createStage, getStagesByRti, updateStageByName } = require('../controllers/stageController');

const router = express.Router();

router.post('/', createStage);
router.get('/:rtiId', getStagesByRti);
router.put('/:rtiId/:stageName', updateStageByName);

module.exports = router;
