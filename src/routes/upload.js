const express = require('express');
const router = express.Router();
const UploadController = require('../app/controllers/uploadController');

router.post('/tmp/:tmpFolder', UploadController.uploadTmp);

module.exports = router;
