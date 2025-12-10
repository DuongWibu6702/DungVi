const Member = require('../models/Members');
const { ObjectId } = require('mongodb');
const fs = require("fs");
const path = require("path");

class AdminAchievementService {

    async listSubmissions() {
        return Member.aggregate([
            { $unwind: "$achievements" },
            { $match: { "achievements.approved": false } },
            {
                $group: {
                    _id: "$achievements.submissionId",
                    memberId: { $first: "$_id" },
                    memberName: { $first: "$name" },
                    schoolYear: { $first: "$achievements.schoolYear" },
                    semester: { $first: "$achievements.semester" },
                    file: { $first: "$achievements.file" },
                    fileType: { $first: "$achievements.fileType" },
                    createdAt: { $first: "$achievements.createdAt" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
    }

    async getSubmission(submissionId) {
        const result = await Member.aggregate([
            { $unwind: "$achievements" },
            {
                $match: {
                    "achievements.submissionId": new ObjectId(submissionId)
                }
            },
            {
                $group: {
                    _id: "$_id",
                    member: { $first: "$$ROOT" },
                    achievements: { $push: "$achievements" }
                }
            }
        ]);

        if (!result.length) return null;

        return {
            member: result[0].member,
            achievements: result[0].achievements
        };
    }


    async approve(submissionId) {
        submissionId = new ObjectId(submissionId);

        const file = await this.getFileBySubmission(submissionId);
        if (file) this.deleteFile(file);

        return Member.updateMany(
            { "achievements.submissionId": submissionId },
            {
                $set: {
                    "achievements.$[elem].approved": true,
                    "achievements.$[elem].file": null // xoá file mark
                }
            },
            {
                arrayFilters: [{ "elem.submissionId": submissionId }]
            }
        );
    }


    async reject(submissionId) {
        submissionId = new ObjectId(submissionId);

        const file = await this.getFileBySubmission(submissionId);
        if (file) this.deleteFile(file);

        return Member.updateMany(
            {},
            { $pull: { achievements: { submissionId } } }
        );
    }


    async requestEdit(submissionId) {
        submissionId = new ObjectId(submissionId);

        return Member.updateMany(
            { "achievements.submissionId": submissionId },
            {
                $set: {
                    "achievements.$[elem].approved": false
                }
            },
            {
                arrayFilters: [{ "elem.submissionId": submissionId }]
            }
        );
    }


    async getFileBySubmission(submissionId) {
        const result = await Member.aggregate([
            { $unwind: "$achievements" },
            { $match: { "achievements.submissionId": submissionId } },
            { $limit: 1 },
            { $project: { file: "$achievements.file" } }
        ]);

        return result.length ? result[0].file : null;
    }


    deleteFile(filePath) {
        const fullPath = path.join(__dirname, "../../public", filePath);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}

module.exports = new AdminAchievementService();
