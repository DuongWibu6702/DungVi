const express = require('express');
const router = express.Router();

const ProfileController = require('../app/controllers/ProfileController');

router.get('/profile/:id', ProfileController.show);

module.exports = router;
