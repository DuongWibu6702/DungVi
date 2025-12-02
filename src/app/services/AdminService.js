const Admin = require('../models/Admin');
const User = require('../models/Users');

class AdminService {

    /* -------------------------------------------------------------
       ADMIN LOGIN
    ------------------------------------------------------------- */
    async login(email, password) {
        if (!email || !password) {
            throw new Error("Vui lòng nhập đầy đủ thông tin.");
        }

        const admin = await Admin.findOne({ email });
        if (!admin) throw new Error("Email không tồn tại.");

        const match = await admin.comparePassword(password);
        if (!match) throw new Error("Mật khẩu không đúng.");

        return admin;
    }

    /* -------------------------------------------------------------
       SEARCH USERS WITH FILTER + PAGINATION
    ------------------------------------------------------------- */
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

        if (query.role) {
            conditions.role = query.role;
        }

        const [users, total] = await Promise.all([
            User.find(conditions).limit(limit).skip(skip).lean(),
            User.countDocuments(conditions)
        ]);

        return { users, total };
    }

    /* -------------------------------------------------------------
       UPDATE USER ROLE (không cho đổi thành admin)
    ------------------------------------------------------------- */
    async updateUserRole(id, role) {
        const validRoles = ['author', 'member', 'viewer'];

        if (!validRoles.includes(role)) {
            throw new Error("Vai trò không hợp lệ.");
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).lean();

        if (!user) {
            throw new Error("User không tồn tại.");
        }

        return user;
    }
}

module.exports = new AdminService();
