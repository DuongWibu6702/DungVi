const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const Member = require('../models/Members');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizePhone(raw) {
    if (!raw) return '';
    let phone = String(raw).replace(/[\s\-().]/g, '');
    if (phone.startsWith('0')) phone = '+84' + phone.slice(1);
    return phone;
}

class MemberService {
    async registerMember(name, email, phone, password) {
        const normEmail = normalizeEmail(email);
        const normPhone = normalizePhone(phone);

        const exists = await User.findOne({
            $or: [{ email: normEmail }, { phone: normPhone }]
        });

        if (exists) {
            const msg = 'Email hoặc số điện thoại đã tồn tại.';
            const error = new Error(msg);
            error.msg = msg;
            throw error;
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
        return await User.findById(userId).lean();
    }

    async updateProfile(userId, data) {
        const { name, email, phone } = data;

        const normEmail = normalizeEmail(email);
        const normPhone = normalizePhone(phone);

        const conflict = await User.findOne({
            _id: { $ne: userId },
            $or: [{ email: normEmail }, { phone: normPhone }]
        });

        if (conflict) {
            const msg = 'Email hoặc số điện thoại đã tồn tại.';
            const error = new Error(msg);
            error.msg = msg;
            throw error;
        }

        return await User.findByIdAndUpdate(
            userId,
            {
                name: name.trim(),
                email: normEmail,
                phone: normPhone
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

        if (/^\S+@\S+\.\S+$/.test(acct)) {
            return await Member.findOne({ email: normalizeEmail(acct) });
        }

        return await Member.findOne({ phone: normalizePhone(acct) });
    }
}

module.exports = new MemberService();
