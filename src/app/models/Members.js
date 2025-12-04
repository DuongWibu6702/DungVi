const mongoose = require('mongoose');
const User = require('./Users');

const Member = User.discriminator(
    'Member',
    new mongoose.Schema({
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: v =>
                    /^(\+84|0)(3|5|7|8|9)\d{8}$/
                        .test(v.replace(/[\s\-().]/g, '')),
                message: 'Số điện thoại không hợp lệ (VN)'
            }
        }
    })
);

module.exports = Member;
