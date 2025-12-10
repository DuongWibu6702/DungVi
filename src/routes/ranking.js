const express = require('express');
const router = express.Router();

const RankingController = require('../app/controllers/RankingController');

router.get('/year', RankingController.yearRanking);

module.exports = router;
