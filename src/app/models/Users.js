const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Làm sạch tên người dùng
function capitalizeName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: (v) => /^\S+@\S+\.\S+$/.test(v),
                message: 'Email không hợp lệ'
            }
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: (v) =>
                    /^(\+84|0)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s\-().]/g, '')),
                message: 'Số điện thoại không hợp lệ (VN)'
            }
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            enum: ['member'],
            default: 'member'
        }
    },
    { timestamps: true }
);

// Format tên trước khi lưu
UserSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.name = capitalizeName(this.name);
    }
    next();
});

// Hash password
UserSchema.pre('save', async function (next) {
    // Nếu mật khẩu không đổi → bỏ qua
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
