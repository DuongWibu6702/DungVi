const express = require('express');
const router = express.Router();

const CommentController = require('../app/controllers/CommentController');
const { requireLogin } = require('../app/middlewares/websession');

router.post('/:postId', requireLogin, CommentController.create);
router.post('/reply/:postId/:parentId', requireLogin, CommentController.reply);
router.delete('/:id', requireLogin, CommentController.delete);

module.exports = router;
