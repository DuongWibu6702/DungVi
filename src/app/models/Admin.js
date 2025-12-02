const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

function isStrongPassword(password) {
    return /^(?=.{12,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).*$/.test(password);
}

function capitalizeName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        require: true,
        default: 'admin'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

/* PRE-SAVE */
AdminSchema.pre('save', async function (next) {

    // Chuẩn hóa tên
    if (this.isModified('name')) {
        this.name = capitalizeName(this.name);
    }

    // Validate email
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
        return next(new Error("Email không hợp lệ"));
    }

    // Validate mật khẩu mạnh
    if (!this.isModified('password')) return next();

    if (!isStrongPassword(this.password)) {
        return next(new Error("Mật khẩu yếu (tối thiểu 12 ký tự, gồm chữ hoa, chữ thường, số, ký tự đặc biệt)"));
    }

    // Tránh hash lại
    if (this.password.startsWith("$2b$")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

AdminSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
