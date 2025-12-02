const User = require('../models/Users');

class AuthService {

    async login(account, password) {

        let query = {};

        // Email
        if (/^\S+@\S+\.\S+$/.test(account)) {
            query.email = account.trim().toLowerCase();
        }
        // Phone
        else {
            let normalized = account.replace(/[\s\-().]/g, '');
            if (normalized.startsWith('0')) {
                normalized = '+84' + normalized.slice(1);
            }
            query.phone = normalized;
        }

        const user = await User.findOne(query);
        if (!user) throw { msg: 'Tài khoản không tồn tại.' };

        // Chặn admin login ở login thường
        if (user.role === 'admin') {
            throw {
                msg: 'Vui lòng đăng nhập qua trang quản trị.',
                redirect: `/admin/login/${process.env.ADMIN_LOGIN_SLUG}`
            };
        }

        const match = await user.comparePassword(password);
        if (!match) throw { msg: 'Mật khẩu không đúng.' };

        return user;
    }
}

module.exports = new AuthService();
