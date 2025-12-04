const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
            maxlength: 100,
            validate: {
                validator: v => v.trim().length >= 2,
                message: 'Tên quá ngắn'
            }
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: v => /^\S+@\S+\.\S+$/.test(v),
                message: 'Email không hợp lệ'
            }
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        }
    },
    {
        timestamps: true,
        discriminatorKey: 'type',
        collection: 'users'
    }
);

UserSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.name = capitalizeName(this.name);
    }
    next();
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
