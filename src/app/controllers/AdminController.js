const AdminService = require('../services/AdminService');

class AdminController {

    // [GET] /admin/:slug/login
    loginForm(req, res) {
        const slug = req.params.slug;

        res.render('admin/login', {
            slug,
            loginAction: `/admin/${slug}/login`,
            error: null
        });
    }

    // [POST] /admin/:slug/login
    async login(req, res) {
        const slug = req.params.slug;

        try {
            const { email, password } = req.body;

            const admin = await AdminService.login(email, password);

            req.session.user = {
                _id: admin._id.toString(),
                name: admin.name,
                email: admin.email,
                type: "Admin"
            };

            res.redirect('/admin');
        } catch (err) {
            res.render('admin/login', {
                slug,
                loginAction: `/admin/${slug}/login`,
                error: err.message || 'Đăng nhập thất bại.'
            });
        }
    }

    // [GET] /admin/
    dashboard(req, res) {
        res.render('admin/dashboard', {
            user: req.session.user
        });
    }

    // [GET] /admin/users
    async listUsers(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const query = {
            q: req.query.q || '',
            type: req.query.type || ''
        };

        try {
            const result = await AdminService.searchUsers(query, limit, skip);

            const totalPages = Math.ceil(result.total / limit);

            res.render('admin/users', {
                users: result.users,
                pagination: {
                    totalPages,
                    currentPage: page,
                    prev: page > 1 ? page - 1 : 1,
                    next: page < totalPages ? page + 1 : totalPages
                },
                query
            });

        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    // [POST] /admin/users/:id/toggle-active
    async toggleActive(req, res) {
        try {
            await AdminService.toggleActive(req.params.id);
            res.redirect('/admin/users');
        } catch (err) {
            res.status(400).send(err.message);
        }
    }

    // [DELETE] /admin/users/:id
    async deleteUser(req, res) {
        try {
            await AdminService.deleteUser(req.params.id);
            res.redirect('/admin/users');
        } catch (err) {
            res.status(400).send(err.message);
        }
    }
    
    // [PATCH] /admin/users/:id/change-type
    async changeType(req, res) {
        try {
            const { newType } = req.body;

            const updated = await AdminService.changeType(req.params.id, newType);

            if (req.session.user?._id === updated._id.toString()) {
                req.session.user.type = updated.type;
                if (updated.active !== undefined) {
                    req.session.user.active = updated.active;
                }
            }

            res.redirect('/admin/users');

        } catch (err) {
            res.status(400).send(err.message);
        }
    }
}

module.exports = new AdminController();
