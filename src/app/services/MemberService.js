const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Member = require('../models/Members');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function cleanPhone(raw) {
    if (!raw) return '';
    return String(raw).replace(/[^\d+]/g, '');
}

class MemberService {

    async registerMember(name, email, phone, password) {
        const normEmail = normalizeEmail(email);
        const normPhone = cleanPhone(phone);

        const exists = await User.findOne({
            $or: [{ email: normEmail }, { phone: normPhone }]
        });

        if (exists) {
            const err = new Error('Email hoặc số điện thoại đã tồn tại.');
            err.msg = err.message;
            throw err;
        }

        const member = new Member({
            name,
            email: normEmail,
            phone: normPhone,
            password
        });

        await member.save();
        return member;
    }

    async getById(userId) {
        return await User.findById(userId);
    }

    async updateProfile(userId, data) {
        const { name, phone } = data;

        let phoneClean = "";

        if (phone && phone.trim() !== "") {
            phoneClean = cleanPhone(phone);

            const conflict = await User.findOne({
                _id: { $ne: userId },
                phone: phoneClean
            });

            if (conflict) {
                const err = new Error("Số điện thoại đã tồn tại.");
                err.msg = err.message;
                throw err;
            }
        }

        return await User.findByIdAndUpdate(
            userId,
            {
                name: name.trim(),
                phone: phoneClean
            },
            { new: true }
        );
    }

    async updatePassword(userId, newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        return await User.findByIdAndUpdate(
            userId,
            { password: hashed },
            { new: true }
        );
    }

    async findByAccount(account) {
        if (!account || typeof account !== 'string') return null;

        const acct = account.trim();
        const isEmail = /^\S+@\S+\.\S+$/.test(acct);

        if (isEmail) {
            return await User.findOne({ email: normalizeEmail(acct) });
        }

        return await User.findOne({ phone: cleanPhone(acct) });
    }
}

module.exports = new MemberService();
