const mongoose = require('mongoose');
const User = require('./Users');

const Author = User.discriminator(
    'Author',
    new mongoose.Schema({
        active: { type: Boolean, default: false }
    })
);

module.exports = Author;
