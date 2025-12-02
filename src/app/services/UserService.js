const User = require('../models/Users');

class UserService {

    // Đăng ký
    async register(name, email, phone, password) {
        const exists = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }]
        });

        if (exists) {
            const msg = 'Email hoặc số điện thoại đã tồn tại.';
            const error = new Error(msg);
            error.msg = msg;
            throw error;
        }

        const user = new User({
            name,
            email: email.toLowerCase(),
            phone,
            password
        });

        await user.save();
        return user;
    }

    // Lấy user theo ID
    async getById(userId) {
        return await User.findById(userId).lean();
    }

    // Cập nhật hồ sơ
    async updateProfile(userId, data) {
        const { name, email, phone } = data;

        return await User.findByIdAndUpdate(
            userId,
            {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim()
            },
            { new: true }
        );
    }

    // Tìm user theo email hoặc số điện thoại
    async findByAccount(account) {
        let query = {};

        if (/^\S+@\S+\.\S+$/.test(account)) {
            query.email = account.trim().toLowerCase();
        } else {
            if (typeof account !== 'string') return null;

            let normalizedPhone = account.replace(/[\s\-().]/g, '');
            if (normalizedPhone.startsWith('0')) {
                normalizedPhone = '+84' + normalizedPhone.slice(1);
            }
            query.phone = normalizedPhone;
        }

        return await User.findOne(query);
    }
}

module.exports = new UserService();
