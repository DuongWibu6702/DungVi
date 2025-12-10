const express = require('express');
const router = express.Router();

const AchievementController = require('../app/controllers/AchievementController');
const uploadTmp = require('../app/middlewares/upload');
const { requireMember } = require('../app/middlewares/websession');

const uploadAchievement = uploadTmp("achievements");

router.get('/add', requireMember, AchievementController.addForm);
router.post('/add', requireMember, uploadAchievement, AchievementController.add);

module.exports = router;
