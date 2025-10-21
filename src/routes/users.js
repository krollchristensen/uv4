const express = require('express');
const router = express.Router();
const submitController = require('../controllers/submitController');
const validateUser = require('../middleware/validateUser');

router.post('/submit', validateUser, submitController.submitData);
router.get('/', submitController.getUsers);
router.get('/download', submitController.downloadFile);

module.exports = router;
