const MemberService = require('../services/MemberService');
const User = require('../models/Users');

class MemberController {

    // [GET] /member/login
    loginForm(req, res) {
        res.render('member/login', { error: null });
    }

    // [POST] /member/login
    async login(req, res) {
        try {
            const { account, password } = req.body;

            if (!account || !password) {
                return res.render('member/login', { error: 'Vui lòng nhập đầy đủ thông tin.' });
            }

            const user = await MemberService.findByAccount(account);

            if (!user || user.type !== "Member") {
                return res.render('member/login', { error: 'Tài khoản không tồn tại.' });
            }

            const match = await user.comparePassword(password);
            if (!match) {
                return res.render('member/login', { error: 'Mật khẩu không đúng.' });
            }

            req.session.user = {
                _id: user._id.toString(),
                name: user.name,
                type: user.type
            };

            res.redirect('/');
        } catch (error) {
            res.render('member/login', { error: error.message || 'Đăng nhập thất bại.' });
        }
    }

    // [GET] /member/register
    registerForm(req, res) {
        res.render('member/register', { error: null });
    }

    // [POST] /member/register
    async register(req, res) {
        try {
            const { name, email, phone, password, confirmPassword } = req.body;

            if (!name || !email || !phone || !password || !confirmPassword) {
                return res.render('member/register', { error: 'Vui lòng nhập đầy đủ thông tin.' });
            }

            if (password !== confirmPassword) {
                return res.render('member/register', { error: 'Mật khẩu nhập lại không khớp.' });
            }

            await MemberService.registerMember(
                name.trim(),
                email.trim(),
                phone.trim(),
                password.trim()
            );

            res.redirect('/member/login');
        } catch (error) {
            res.render('member/register', { error: error.msg || error.message || 'Lỗi hệ thống' });
        }
    }

    // [GET] /member/profile
    async profile(req, res) {
        if (!req.session.user) return res.redirect('/member/login');

        const user = await MemberService.getById(req.session.user._id);

        res.render('member/profile', { user, error: null, success: null });
    }

    // [POST] /member/profile
    async updateProfile(req, res) {
        try {
            if (!req.session.user) return res.redirect('/member/login');

            const userId = req.session.user._id;
            const { name, email, phone, verifyPassword } = req.body;

            if (!name || !email || !phone || !verifyPassword) {
                const user = await MemberService.getById(userId);
                return res.render('member/profile', {
                    user,
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    success: null
                });
            }

            const fullUser = await User.findById(userId);
            const match = await fullUser.comparePassword(verifyPassword);

            if (!match) {
                const user = await MemberService.getById(userId);
                return res.render('member/profile', {
                    user,
                    error: 'Mật khẩu xác nhận không đúng.',
                    success: null
                });
            }

            await MemberService.updateProfile(userId, { name, email, phone });

            const updatedUser = await MemberService.getById(userId);

            res.render('member/profile', {
                user: updatedUser,
                success: 'Cập nhật thành công.',
                error: null
            });

        } catch (error) {
            const user = await MemberService.getById(req.session.user._id);
            res.render('member/profile', {
                user,
                error: error.message || 'Lỗi hệ thống',
                success: null
            });
        }
    }

    // [GET] /member/password
    async password(req, res) {
        if (!req.session.user) return res.redirect('/member/login');

        const user = await MemberService.getById(req.session.user._id);
        res.render('member/password', { user, error: null, success: null });
    }

    // [POST] /member/password
    async updatePassword(req, res) {
        try {
            const userId = req.session.user?._id;
            if (!userId) return res.redirect('/member/login');

            const { oldPassword, newPassword, confirmPassword } = req.body;
            const user = await User.findById(userId);

            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.render('member/password', {
                    user,
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    success: null
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('member/password', {
                    user,
                    error: 'Mật khẩu nhập lại không khớp.',
                    success: null
                });
            }

            const match = await user.comparePassword(oldPassword);
            if (!match) {
                return res.render('member/password', {
                    user,
                    error: 'Mật khẩu hiện tại không đúng.',
                    success: null
                });
            }

            await MemberService.updatePassword(userId, newPassword);

            res.render('member/profile', {
                user,
                success: 'Đổi mật khẩu thành công.',
                error: null
            });

        } catch (error) {
            const user = await MemberService.getById(req.session.user._id);
            res.render('member/password', {
                user,
                error: error.message || 'Lỗi hệ thống',
                success: null
            });
        }
    }

    // [POST] /member/verify-password
    async verifyPassword(req, res) {
        try {
            if (!req.session.user) return res.json({ error: "Bạn chưa đăng nhập." });

            const { password } = req.body;
            if (!password) return res.json({ error: "Vui lòng nhập mật khẩu." });

            const user = await User.findById(req.session.user._id);
            if (!user) return res.json({ error: "Không tìm thấy người dùng." });

            const match = await user.comparePassword(password);
            if (!match) return res.json({ error: "Mật khẩu không đúng." });

            res.json({ success: true });
        } catch {
            res.json({ error: "Lỗi hệ thống." });
        }
    }
}

module.exports = new MemberController();
