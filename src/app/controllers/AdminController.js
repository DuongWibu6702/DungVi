const AdminService = require('../services/AdminService');

class AdminController {

    loginForm(req, res) {
        const slug = req.params.slug;

        res.render('admin/login', {
            slug,
            loginAction: `/admin/${slug}/login`,
            error: null
        });
    }

    async login(req, res) {
        const slug = req.params.slug;

        try {
            const { email, password } = req.body;

            const admin = await AdminService.login(email, password);

            req.session.user = {
                _id: admin._id.toString(),
                name: admin.name,
                email: admin.email,
                role: "admin"
            };

            res.redirect('/admin');

        } catch (err) {
            res.render('admin/login', {
                slug,
                loginAction: `/admin/${slug}/login`,
                error: err.message || 'Đăng nhập thất bại'
            });
        }
    }

    dashboard(req, res) {
        res.render('admin/dashboard', {
            user: req.session.user
        });
    }

    async listUsers(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const query = {
            q: req.query.q || '',
            role: req.query.role || ''
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

    async updateRole(req, res) {
        try {
            await AdminService.updateUserRole(req.params.id, req.body.role);
            res.redirect('/admin/users');
        } catch (err) {
            res.status(400).send(err.message);
        }
    }

    logout(req, res) {
        req.session.user = null;
        res.redirect('/');
    }
}

module.exports = new AdminController();