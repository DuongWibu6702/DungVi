const mongoose = require('mongoose');
const subjects = require('../constants/subjects');

const AchievementSchema = new mongoose.Schema({
    submissionId: { type: mongoose.Schema.Types.ObjectId, required: true },

    schoolYear: { type: Number, required: true },
    schoolClass: { type: Number, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, enum: subjects, required: true },
    score: { type: Number, min: 0, max: 10, required: true },

    approved: { type: Boolean, default: false },

    file: { type: String, default: null },
    fileType: { type: String },

    createdAt: { type: Date, default: Date.now }
}, { _id: false });

module.exports = AchievementSchema;
