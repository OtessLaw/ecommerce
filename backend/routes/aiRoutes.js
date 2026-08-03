const express = require('express');
const router = express.Router();
const { chatWithAIAgent } = require('../controllers/aiController');

router.post('/chat', chatWithAIAgent);

module.exports = router;
