const mongoose = require('mongoose');
const User = require('./Users');

const Admin = User.discriminator(
    'Admin',
    new mongoose.Schema({})
);

module.exports = Admin;
