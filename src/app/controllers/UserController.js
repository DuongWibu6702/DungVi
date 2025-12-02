const UserService = require('../services/UserService');
const User = require('../models/Users');

class UserController {

    // [GET] /user/login
    loginForm(req, res) {
        res.render('user/auth/login', { error: null });
    }

    // [POST] /user/login
    async login(req, res) {
        try {
            const { account, password } = req.body;

            if (!account || !password) {
                return res.render('user/login', {
                    error: 'Vui lòng nhập đầy đủ thông tin.'
                });
            }

            const user = await UserService.findByAccount(account);
            if (!user) {
                return res.render('user/login', {
                    error: 'Tài khoản không tồn tại.'
                });
            }

            if (user.role === 'admin') {
                return res.render('user/login', {
                    error: 'Tài khoản admin không đăng nhập tại đây.'
                });
            }

            const match = await user.comparePassword(password);
            if (!match) {
                return res.render('user/login', {
                    error: 'Mật khẩu không đúng.'
                });
            }

            req.session.user = {
                _id: user._id.toString(),
                name: user.name,
                role: user.role
            };

            return res.redirect('/');

        } catch (err) {
            return res.render('user/login', {
                error: err.message || 'Đăng nhập thất bại.'
            });
        }
    }

    // [GET] /user/register
    registerForm(req, res) {
        res.render('user/register', { error: null });
    }

    // [POST] /user/register
    async register(req, res) {
        try {
            const { name, email, phone, password, confirmPassword } = req.body;

            if (!name || !email || !phone || !password || !confirmPassword) {
                return res.render('user/register', {
                    error: 'Vui lòng nhập đầy đủ thông tin.'
                });
            }

            if (password !== confirmPassword) {
                return res.render('user/register', {
                    error: 'Mật khẩu nhập lại không khớp.'
                });
            }

            await UserService.register(
                name.trim(),
                email.trim(),
                phone.trim(),
                password.trim()
            );

            return res.redirect('/login');

        } catch (err) {
            return res.render('user/register', {
                error: err.msg || 'Lỗi hệ thống'
            });
        }
    }

    // [GET] /user/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            return res.redirect('/');
        });
    }

    // [GET] /user/profile
    async profile(req, res) {
        if (!req.session.user) return res.redirect('/login');

        const user = await UserService.getById(req.session.user._id);

        return res.render('user/profile', {
            user,
            error: null,
            success: null
        });
    }

    // [POST] /user/profile
    async updateProfile(req, res) {
        try {
            if (!req.session.user) return res.redirect('/login');

            const { name, email, phone } = req.body;

            if (!name || !email || !phone) {
                const user = await UserService.getById(req.session.user._id);
                return res.render('user/profile', {
                    user,
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    success: null
                });
            }

            await UserService.updateProfile(req.session.user._id, {
                name,
                email,
                phone
            });

            const user = await UserService.getById(req.session.user._id);

            return res.render('user/profile', {
                user,
                error: null,
                success: 'Cập nhật thành công.'
            });

        } catch (err) {
            const user = await UserService.getById(req.session.user._id);
            return res.render('user/profile', {
                user,
                error: err.message || 'Lỗi hệ thống',
                success: null
            });
        }
    }
}

module.exports = new UserController();
