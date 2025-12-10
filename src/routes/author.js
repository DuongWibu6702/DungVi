const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const { requireAuthor } = require('../app/middlewares/websession');
const AuthorController = require('../app/controllers/AuthorController');

const storage = multer.diskStorage({
    destination: (req, file, cb) =>
        cb(null, path.join(__dirname, '../public/uploads/tmp')),
    filename: (req, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname)
});

const uploadThumbnail = multer({ storage }).single('thumbnail');

router.get('/stored/news', requireAuthor, AuthorController.stored);
router.get('/trash/news', requireAuthor, AuthorController.trash);
router.get('/posts/add-new', requireAuthor, AuthorController.createForm);
router.post('/posts/store', requireAuthor, uploadThumbnail, AuthorController.store);
router.get('/posts/edit/:id', requireAuthor, AuthorController.editForm);
router.put('/posts/:id', requireAuthor, uploadThumbnail, AuthorController.update);
router.delete('/posts/:id', requireAuthor, AuthorController.destroy);
router.delete('/posts/force/:id', requireAuthor, AuthorController.forceDestroy);
router.patch('/posts/restore/:id', requireAuthor, AuthorController.restore);
router.post('/posts/clone/:id', requireAuthor, AuthorController.clone);

module.exports = router;
