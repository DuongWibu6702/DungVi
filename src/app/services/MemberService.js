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
            const error = new Error('Email hoặc số điện thoại đã tồn tại.');
            error.msg = 'Email hoặc số điện thoại đã tồn tại.';
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
        return await User.findById(userId); // document, không lean()
    }

    async updateProfile(userId, data) {
        const { name, phone } = data;
        const phoneClean = cleanPhone(phone);

        if (phoneClean) {
            const conflict = await User.findOne({
                _id: { $ne: userId },
                phone: phoneClean
            });

            if (conflict) {
                const error = new Error('Số điện thoại đã tồn tại.');
                error.msg = 'Số điện thoại đã tồn tại.';
                throw error;
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

        if (/^\S+@\S+\.\S+$/.test(acct)) {
            return await Member.findOne({ email: normalizeEmail(acct) });
        }

        return await Member.findOne({ phone: cleanPhone(acct) });
    }
}

module.exports = new MemberService();
