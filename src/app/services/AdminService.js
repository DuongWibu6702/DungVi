const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Admin = require('../models/Admins');

function normalizeEmail(email = '') {
    return String(email).trim().toLowerCase();
}

class AdminService {
    async login(email, password) {
        if (!email || !password) {
            throw new Error("Vui lòng nhập đầy đủ thông tin.");
        }

        const normEmail = normalizeEmail(email);

        const admin = await Admin.findOne({ email: normEmail });
        if (!admin) throw new Error("Email không tồn tại.");

        const match = await admin.comparePassword(password);
        if (!match) throw new Error("Mật khẩu không đúng.");

        return admin;
    }

    async searchUsers(query, limit, skip) {
        let conditions = {};

        if (query.q) {
            const regex = new RegExp(query.q, 'i');
            conditions.$or = [
                { name: regex },
                { email: regex },
                { phone: regex }
            ];
        }

        if (query.type) {
            conditions.type = query.type; 
        }

        const [users, total] = await Promise.all([
            User.find(conditions)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            User.countDocuments(conditions)
        ]);

        return { users, total };
    }

    async toggleActive(id) {
        const user = await User.findById(id);
        if (!user) throw new Error("Không tìm thấy user.");

        if (user.type !== "Author") {
            throw new Error("Chỉ tác giả mới có trạng thái active.");
        }

        user.active = !user.active;
        await user.save();

        return user;
    }

    async deleteUser(id) {
        const user = await User.findById(id);
        if (!user) throw new Error("Không tìm thấy user.");

        if (user.type === "Admin") {
            throw new Error("Không thể xóa tài khoản Admin.");
        }

        return User.findByIdAndDelete(id);
    }
}

module.exports = new AdminService();
