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

        const doc = await MemberService.getById(req.session.user._id);
        const user = doc.toObject();

        res.render('member/profile', { user, error: null, success: null });
    }

    // [POST] /member/profile
    async updateProfile(req, res) {
        try {
            if (!req.session.user) return res.redirect('/member/login');

            const userId = req.session.user._id;
            const { name, phone, verifyPassword } = req.body;

            const doc = await MemberService.getById(userId);
            const user = doc.toObject();

            if (!verifyPassword) {
                return res.render('member/profile', {
                    user,
                    error: "Bạn cần xác nhận mật khẩu.",
                    success: null
                });
            }

            const match = await doc.comparePassword(verifyPassword);
            if (!match) {
                return res.render('member/profile', {
                    user,
                    error: "Mật khẩu xác nhận không đúng.",
                    success: null
                });
            }

            if (!name || !name.trim()) {
                return res.render('member/profile', {
                    user,
                    error: "Họ tên không được để trống.",
                    success: null
                });
            }

            let phoneClean = "";
            if (phone && phone.trim() !== "") {
                const normalized = phone.trim().replace(/[^\d+]/g, "");
                const isValidVN = /^(\+84|0)(3|5|7|8|9)\d{8}$/.test(normalized);

                if (!isValidVN) {
                    return res.render('member/profile', {
                        user,
                        error: "Số điện thoại không hợp lệ.",
                        success: null
                    });
                }

                phoneClean = normalized;
            }

            await MemberService.updateProfile(userId, {
                name: name.trim(),
                phone: phoneClean
            });

            const updatedDoc = await MemberService.getById(userId);
            const updatedUser = updatedDoc.toObject();

            res.render('member/profile', {
                user: updatedUser,
                success: 'Cập nhật thành công.',
                error: null
            });

        } catch (error) {
            const doc = await MemberService.getById(req.session.user._id);
            const user = doc.toObject();

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

        const doc = await MemberService.getById(req.session.user._id);
        const user = doc.toObject();

        res.render('member/password', { user, error: null, success: null });
    }

    // [PATCH] /member/password
    async updatePassword(req, res) {
        try {
            const userId = req.session.user?._id;
            if (!userId) return res.redirect('/member/login');

            const { oldPassword, newPassword, confirmPassword } = req.body;
            const doc = await User.findById(userId);

            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    success: null
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: 'Mật khẩu nhập lại không khớp.',
                    success: null
                });
            }

            const match = await doc.comparePassword(oldPassword);
            if (!match) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: 'Mật khẩu hiện tại không đúng.',
                    success: null
                });
            }

            await MemberService.updatePassword(userId, newPassword);

            res.render('member/password', {
                user: doc.toObject(),
                success: 'Đổi mật khẩu thành công.',
                error: null
            });

        } catch (error) {
            const doc = await MemberService.getById(req.session.user._id);
            const user = doc.toObject();

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
            if (!req.session.user) {
                return res.json({ success: false, message: "Bạn chưa đăng nhập." });
            }

            const { password } = req.body;
            if (!password) {
                return res.json({ success: false, message: "Vui lòng nhập mật khẩu." });
            }

            const doc = await User.findById(req.session.user._id);
            if (!doc) {
                return res.json({ success: false, message: "Không tìm thấy người dùng." });
            }

            const match = await doc.comparePassword(password);
            if (!match) {
                return res.json({ success: false, message: "Mật khẩu không đúng." });
            }

            return res.json({ success: true });

        } catch {
            return res.json({ success: false, message: "Lỗi hệ thống." });
        }
    }
}

module.exports = new MemberController();
