const express = require('express');
const { createNote, getNotesByRti } = require('../controllers/noteController');

const router = express.Router();

router.post('/', createNote);
router.get('/:rtiId', getNotesByRti);

module.exports = router;