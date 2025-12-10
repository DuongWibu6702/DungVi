const mongoose = require("mongoose");
const User = require('../models/Users');
const Member = require('../models/Members');
const Author = require('../models/Authors'); 
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

    async changeType(userId, newType) {
        const oldUser = await User.findById(userId);
        if (!oldUser) throw new Error("Không tìm thấy tài khoản.");

        if (oldUser.type === "Admin") {
            throw new Error("Không thể thay đổi quyền của Admin.");
        }

        if (newType === "Admin") {
            throw new Error("Không thể chuyển sang Admin.");
        }

        if (oldUser.type === newType) return oldUser;

        const data = oldUser.toObject();
        delete data._id;
        delete data.__v;

        await User.deleteOne({ _id: userId });

        const newData = {
            _id: new mongoose.Types.ObjectId(userId),
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            type: newType
        };

        if (newType === "Author") {
            newData.active = false;
        }

        const model = newType === "Author" ? Author : Member;
        await model.collection.insertOne(newData);

        return await model.findById(userId);
    }
}

module.exports = new AdminService();
