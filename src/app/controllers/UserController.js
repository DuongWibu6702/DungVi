const AuthService = require('../services/UserService');
const User = require('../models/Users');

class AuthController {

    // [GET] /user/auth/login
    loginForm(req, res) {
        res.render('user/auth/login', {
            error: null
        });
    }

    // [POST] /user/auth/login
    async login(req, res) {
        try {
            const { account, password } = req.body;

            if (!account || !password) {
                return res.render('user/auth/login', {
                    error: 'Vui lòng nhập đầy đủ thông tin.'
                });
            }

            let query = {};

            if (/^\S+@\S+\.\S+$/.test(account)) {
                query.email = account.trim().toLowerCase();
            }
            else {
                if (typeof account !== 'string') {
                    return res.render('user/auth/login', { error: 'Tài khoản không hợp lệ.' });
                }

                let normalizedPhone = account.replace(/[\s\-().]/g, '');
                if (normalizedPhone.startsWith('0')) {
                    normalizedPhone = '+84' + normalizedPhone.slice(1);
                }
                query.phone = normalizedPhone;
            }

            const user = await User.findOne(query);
            if (!user) {
                return res.render('user/auth/login', {
                    error: 'Tài khoản không tồn tại.'
                });
            }

            if (user.role === 'admin') {
                return res.render('user/auth/login', {
                    error: 'Tài khoản admin không đăng nhập tại đây.',
                });
            }

            const match = await user.comparePassword(password);
            if (!match) {
                return res.render('user/auth/login', {
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
            return res.render('user/auth/login', {
                error: err.message || 'Đăng nhập thất bại.'
            });
        }
    }

    // [GET] /user/auth/register
    registerForm(req, res) {
        res.render('user/auth/register', {
            error: null
        });
    }

    // [POST] /user/auth/register
    async register(req, res) {
        try {
            const { name, email, phone, password, confirmPassword } = req.body;

            if (!name || !email || !phone || !password || !confirmPassword) {
                return res.render('user/auth/register', {
                    error: 'Vui lòng nhập đầy đủ thông tin.'
                });
            }

            if (password !== confirmPassword) {
                return res.render('user/auth/register', {
                    error: 'Mật khẩu nhập lại không khớp.'
                });
            }

            await AuthService.register(
                name.trim(),
                email.trim(),
                phone.trim(),
                password.trim()
            );

            return res.redirect('/login');

        } catch (err) {
            return res.render('user/auth/register', {
                error: err.msg || 'Lỗi hệ thống'
            });
        }
    }

    // [GET] /user/auth/logout
    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            return res.redirect('/');
        });
    }
}

module.exports = new AuthController();
