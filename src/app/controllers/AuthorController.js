const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const AuthorService = require('../services/AuthorService');

class AuthorController {

    // [GET] /author/stored/news
    stored(req, res, next) {
        AuthorService.getStoredNews()
            .then(([newdb, deletedCount]) => {
                res.render('user/author/storedNews', {
                    newdb: multipleMongooseToObject(newdb),
                    deletedCount
                });
            })
            .catch(next);
    }

    // [GET] /author/trash/news
    trash(req, res, next) {
        AuthorService.getTrashNews()
            .then(newdb => {
                res.render('user/author/trashNews', {
                    newdb: multipleMongooseToObject(newdb)
                });
            })
            .catch(next);
    }

    // [GET] /author/posts/add-new
    createForm(req, res) {
        res.render('user/author/posts/add-new');
    }

    // [POST] /author/posts/store
    store(req, res, next) {
        const sanitizedData = {
            name: req.body.name,
            description: req.body.description,
            body: req.body.body,
            author: req.body.author,
            source: req.body.source,
            tmpFolder: req.body.tmpFolder
        };

        AuthorService.createNews(sanitizedData, req.file)
            .then(() => res.redirect('/author/stored/news'))
            .catch(next);
    }

    // [GET] /author/posts/edit/:id
    editForm(req, res, next) {
        AuthorService.getNewsById(req.params.id)
            .then(newdb => {
                if (!newdb) return res.status(404).send("Không tìm thấy bài viết");
                res.render('user/author/posts/edit', {
                    newdb: mongooseToObject(newdb)
                });
            })
            .catch(next);
    }

    // [PUT] /author/posts/:id
    update(req, res, next) {
        const sanitizedData = {
            name: req.body.name,
            description: req.body.description,
            body: req.body.body,
            author: req.body.author,
            source: req.body.source,
            tmpFolder: req.body.tmpFolder
        };

        AuthorService.updateNews(req.params.id, sanitizedData, req.file)
            .then(() => res.redirect('/author/stored/news'))
            .catch(next);
    }

    // [POST] /author/posts/clone/:id
    clone(req, res, next) {
        AuthorService.cloneNews(req.params.id)
            .then(() => res.redirect('/author/stored/news'))
            .catch(next);
    }

    // [DELETE] /author/posts/:id
    destroy(req, res, next) {
        AuthorService.softDelete(req.params.id)
            .then(() => res.redirect('/author/stored/news'))
            .catch(next);
    }

    // [DELETE] /author/posts/force/:id
    forceDestroy(req, res, next) {
        AuthorService.forceDelete(req.params.id)
            .then(() => res.redirect('/author/trash/news'))
            .catch(next);
    }

    // [PATCH] /author/posts/:id/restore
    restore(req, res, next) {
        AuthorService.restore(req.params.id)
            .then(() => res.redirect('/author/trash/news'))
            .catch(next);
    }
}

module.exports = new AuthorController();
