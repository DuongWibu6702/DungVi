const MemberService = require('../services/MemberService');
const User = require('../models/Users');

class MemberController {

    // [GET] /member/login
    loginForm(req, res) {
        res.render('member/login', { 
            error: null,
            title: 'Đăng nhập tài khoản | DungVi',
            metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
        });
    }

    // [POST] /member/login
    async login(req, res) {
        try {
            const { account, password } = req.body;

            if (!account || !password) {
                return res.render('member/login', { 
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    title: 'Đăng nhập tài khoản | DungVi',
                    metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
                });
            }

            const user = await MemberService.findByAccount(account);
            if (!user) {
                return res.render('member/login', { 
                    error: 'Tài khoản không tồn tại.',
                    title: 'Đăng nhập tài khoản | DungVi',
                    metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
                });
            }

            if (user.type === "Admin") {
                return res.render('member/login', { 
                    error: "Tài khoản không hợp lệ cho trang này.",
                    title: 'Đăng nhập tài khoản | DungVi',
                    metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
                });
            }

            const match = await user.comparePassword(password);
            if (!match) {
                return res.render('member/login', { 
                    error: 'Mật khẩu không đúng.',
                    title: 'Đăng nhập tài khoản | DungVi',
                    metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
                });
            }

            req.session.user = {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                type: user.type,
                phone: user.phone
            };

            if (user.type === "Author") {
                return res.redirect('/author/stored/news');
            }

            return res.redirect('/');

        } catch (error) {
            return res.render('member/login', {
                error: error.message || 'Đăng nhập thất bại.',
                title: 'Đăng nhập tài khoản | DungVi',
                metaDescription: 'Đăng nhập tài khoản thành viên để sử dụng các tính năng của DungVi.'
            });
        }
    }

    // [GET] /member/register
    registerForm(req, res) {
        res.render('member/register', { 
            error: null,
            title: 'Đăng ký tài khoản | DungVi',
            metaDescription: 'Tạo tài khoản thành viên mới tại DungVi để nhận thông tin và cập nhật nhanh chóng.'
        });
    }

    // [POST] /member/register
    async register(req, res) {
        try {
            const { name, email, phone, password, confirmPassword } = req.body;

            if (!name || !email || !phone || !password || !confirmPassword) {
                return res.render('member/register', {
                    error: 'Vui lòng nhập đầy đủ thông tin.',
                    title: 'Đăng ký tài khoản | DungVi',
                    metaDescription: 'Tạo tài khoản thành viên mới tại DungVi để nhận thông tin và cập nhật nhanh chóng.'
                });
            }

            if (password !== confirmPassword) {
                return res.render('member/register', {
                    error: 'Mật khẩu nhập lại không khớp.',
                    title: 'Đăng ký tài khoản | DungVi',
                    metaDescription: 'Tạo tài khoản thành viên mới tại DungVi để nhận thông tin và cập nhật nhanh chóng.'
                });
            }

            await MemberService.registerMember(
                name.trim(),
                email.trim(),
                phone.trim(),
                password.trim()
            );

            res.redirect('/member/login');

        } catch (error) {
            res.render('member/register', {
                error: error.msg || error.message || 'Lỗi hệ thống',
                title: 'Đăng ký tài khoản | DungVi',
                metaDescription: 'Tạo tài khoản thành viên mới tại DungVi để nhận thông tin và cập nhật nhanh chóng.'
            });
        }
    }

    // [GET] /member/profile
    async profile(req, res) {
        if (!req.session.user) return res.redirect('/member/login');

        if (req.session.user.type === "Admin") {
            return res.status(403).send("Không hợp lệ.");
        }

        const doc = await MemberService.getById(req.session.user._id);
        const user = doc.toObject();

        res.render('member/profile', { 
            user, 
            error: null, 
            success: null,
            title: 'Thông tin cá nhân | DungVi',
            metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
        });
    }

    // [POST] /member/profile
    async updateProfile(req, res) {
        try {
            if (!req.session.user) return res.redirect('/member/login');

            if (req.session.user.type === "Admin") {
                return res.status(403).send("Không hợp lệ.");
            }

            const id = req.session.user._id;
            const { name, phone, verifyPassword } = req.body;

            const doc = await MemberService.getById(id);
            const user = doc.toObject();

            if (!verifyPassword) {
                return res.render('member/profile', {
                    user,
                    error: "Bạn cần xác nhận mật khẩu.",
                    success: null,
                    title: 'Thông tin cá nhân | DungVi',
                    metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
                });
            }

            const ok = await doc.comparePassword(verifyPassword);
            if (!ok) {
                return res.render('member/profile', {
                    user,
                    error: "Mật khẩu xác nhận không đúng.",
                    success: null,
                    title: 'Thông tin cá nhân | DungVi',
                    metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
                });
            }

            if (!name || !name.trim()) {
                return res.render('member/profile', {
                    user,
                    error: "Họ tên không được để trống.",
                    success: null,
                    title: 'Thông tin cá nhân | DungVi',
                    metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
                });
            }

            const updated = await MemberService.updateProfile(id, {
                name,
                phone
            });

            req.session.user.name = updated.name;
            req.session.user.phone = updated.phone ?? "";

            res.render('member/profile', {
                user: updated.toObject(),
                success: "Cập nhật thành công.",
                error: null,
                title: 'Thông tin cá nhân | DungVi',
                metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
            });

        } catch (error) {
            const doc = await MemberService.getById(req.session.user._id);
            const user = doc.toObject();

            res.render('member/profile', {
                user,
                error: error.message || 'Lỗi hệ thống',
                success: null,
                title: 'Thông tin cá nhân | DungVi',
                metaDescription: 'Xem và cập nhật thông tin cá nhân tài khoản DungVi.'
            });
        }
    }

    // [GET] /member/password
    async password(req, res) {
        if (!req.session.user) return res.redirect('/member/login');

        if (req.session.user.type === "Admin") {
            return res.status(403).send("Không hợp lệ.");
        }

        const doc = await MemberService.getById(req.session.user._id);

        res.render('member/password', {
            user: doc.toObject(),
            error: null,
            success: null,
            title: 'Đổi mật khẩu | DungVi',
            metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
        });
    }

    // [PATCH] /member/password
    async updatePassword(req, res) {
        try {
            const id = req.session.user?._id;
            if (!id) return res.redirect('/member/login');

            if (req.session.user.type === "Admin") {
                return res.status(403).send("Không hợp lệ.");
            }

            const { oldPassword, newPassword, confirmPassword } = req.body;
            const doc = await User.findById(id);

            if (!oldPassword || !newPassword || !confirmPassword) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: "Vui lòng nhập đầy đủ thông tin.",
                    success: null,
                    title: 'Đổi mật khẩu | DungVi',
                    metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: "Mật khẩu nhập lại không khớp.",
                    success: null,
                    title: 'Đổi mật khẩu | DungVi',
                    metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
                });
            }

            const ok = await doc.comparePassword(oldPassword);
            if (!ok) {
                return res.render('member/password', {
                    user: doc.toObject(),
                    error: "Mật khẩu hiện tại không đúng.",
                    success: null,
                    title: 'Đổi mật khẩu | DungVi',
                    metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
                });
            }

            await MemberService.updatePassword(id, newPassword);

            res.render('member/password', {
                user: doc.toObject(),
                success: "Đổi mật khẩu thành công.",
                error: null,
                title: 'Đổi mật khẩu | DungVi',
                metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
            });

        } catch (error) {
            const doc = await MemberService.getById(req.session.user._id);
            res.render('member/password', {
                user: doc.toObject(),
                error: error.message || "Lỗi hệ thống",
                success: null,
                title: 'Đổi mật khẩu | DungVi',
                metaDescription: 'Thay đổi mật khẩu tài khoản DungVi để bảo mật hơn.'
            });
        }
    }

    // [POST] /member/verify-password
    async verifyPassword(req, res) {
        try {
            const sess = req.session.user;

            if (!sess) {
                return res.json({ success: false, message: "Bạn chưa đăng nhập." });
            }

            if (sess.type === "Admin") {
                return res.json({ success: false, message: "Tài khoản không hợp lệ." });
            }

            const { password } = req.body;
            if (!password) {
                return res.json({ success: false, message: "Vui lòng nhập mật khẩu." });
            }

            const doc = await User.findById(sess._id);
            const ok = await doc.comparePassword(password);

            if (!ok) {
                return res.json({ success: false, message: "Mật khẩu không đúng." });
            }

            return res.json({ success: true });

        } catch {
            return res.json({ success: false, message: "Lỗi hệ thống." });
        }
    }
}

module.exports = new MemberController();
