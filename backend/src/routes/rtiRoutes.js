const express = require('express');
const { createRti, getRtis, getRtiById, updateRti, deleteRti } = require('../controllers/rtiController');

const router = express.Router();

router.route('/').post(createRti).get(getRtis);
router.route('/:id').get(getRtiById).put(updateRti).delete(deleteRti);

module.exports = router;