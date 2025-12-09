const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const AuthorService = require('../services/AuthorService');

class AuthorController {

    // [GET] /author/:slug/register
    registerForm(req, res) {
        const slug = req.params.slug;

        if (slug !== process.env.AUHTOR_LOGIN_SLUG)
            return res.status(403).send("Không hợp lệ.");

        res.render('author/register', {
            slug,
            registerAction: `/author/${slug}/register`,
            error: null
        });
    }

    // [POST] /author/:slug/register
    async register(req, res) {
        const slug = req.params.slug;

        if (slug !== process.env.AUHTOR_LOGIN_SLUG)
            return res.status(403).send("Không hợp lệ.");

        try {
            const { name, email, phone, password, confirm } = req.body;

            if (!name || !email || !phone || !password || !confirm) {
                return res.render('author/register', {
                    slug,
                    registerAction: `/author/${slug}/register`,
                    error: "Vui lòng nhập đầy đủ thông tin."
                });
            }

            if (password !== confirm) {
                return res.render('author/register', {
                    slug,
                    registerAction: `/author/${slug}/register`,
                    error: "Mật khẩu nhập lại không đúng."
                });
            }

            await AuthorService.registerAuthor(
                name.trim(),
                email.trim(),
                password.trim(),
                phone.trim()
            );

            res.render('author/login', {
                slug,
                loginAction: `/author/${slug}/login`,
                error: null
            });

        } catch (err) {
            res.render('author/register', {
                slug,
                registerAction: `/author/${slug}/register`,
                error: err.message
            });
        }
    }

    // [GET] /author/:slug/login
    loginForm(req, res) {
        const slug = req.params.slug;

        if (slug !== process.env.AUHTOR_LOGIN_SLUG)
            return res.status(403).send("Không hợp lệ.");

        res.render('author/login', {
            slug,
            loginAction: `/author/${slug}/login`,
            error: null
        });
    }

    // [POST] /author/:slug/login
    async login(req, res) {
        const slug = req.params.slug;

        if (slug !== process.env.AUHTOR_LOGIN_SLUG)
            return res.status(403).send("Không hợp lệ.");

        try {
            const { email, password } = req.body;

            const author = await AuthorService.loginAuthor(email, password);

            req.session.user = {
                _id: author._id.toString(),
                name: author.name,
                email: author.email,
                type: "Author"
            };

            res.redirect('/author/stored/news');

        } catch (err) {
            res.render('author/login', {
                slug,
                loginAction: `/author/${slug}/login`,
                error: err.message
            });
        }
    }

    // [GET] /author/profile
    async profileForm(req, res) {
        const doc = await AuthorService.getById(req.session.user._id);
        res.render('author/profile', {
            user: doc.toObject(),
            error: null,
            success: null
        });
    }

    // [POST] /author/profile
    async updateProfile(req, res) {
        try {
            const { name, phone, verifyPassword } = req.body;

            const updated = await AuthorService.updateProfile(
                req.session.user._id,
                name,
                phone,
                verifyPassword
            );

            req.session.user.name = updated.name;

            res.render('author/profile', {
                user: updated.toObject(),
                success: "Cập nhật hồ sơ thành công.",
                error: null
            });

        } catch (err) {
            const doc = await AuthorService.getById(req.session.user._id);

            res.render('author/profile', {
                user: doc.toObject(),
                error: err.message,
                success: null
            });
        }
    }

    // [GET] /author/password
    passwordForm(req, res) {
        const doc = req.session.user;
        res.render('author/password', {
            user: doc,
            error: null,
            success: null
        });
    }

    // [POST] /author/password
    async updatePassword(req, res) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            const result = await AuthorService.updatePassword(
                req.session.user._id,
                oldPassword,
                newPassword,
                confirmPassword
            );

            res.render('author/password', {
                success: result.message,
                error: null
            });

        } catch (err) {
            res.render('author/password', {
                error: err.message,
                success: null
            });
        }
    }

    // [POST] /author/verify-password
    async verifyPassword(req, res) {
        try {
            const { password } = req.body;

            const ok = await AuthorService.verifyPassword(req.session.user._id, password);

            if (!ok) return res.json({ success: false, message: "Mật khẩu không đúng." });

            return res.json({ success: true });

        } catch {
            return res.json({ success: false, message: "Lỗi hệ thống." });
        }
    }

    // [GET] /author/stored/news
    stored(req, res, next) {
        AuthorService.getStoredNews()
            .then(([newdb, deletedCount]) => {
                res.render('author/storedNews', {
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
                res.render('author/trashNews', {
                    newdb: multipleMongooseToObject(newdb)
                });
            })
            .catch(next);
    }

    // [GET] /author/posts/add-new
    createForm(req, res) {
        res.render('author/posts/add-new');
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
                res.render('author/posts/edit', {
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

    // [POST] /author/posts/clone/:id
    clone(req, res, next) {
        AuthorService.cloneNews(req.params.id)
            .then(() => res.redirect('/author/stored/news'))
            .catch(next);
    }
}

module.exports = new AuthorController();
