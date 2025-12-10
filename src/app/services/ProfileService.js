const Member = require('../models/Members');
const { ObjectId } = require('mongodb');

class ProfileService {

    async getProfile(memberId) {
        const result = await Member.aggregate([
            { $match: { _id: new ObjectId(memberId) } },
            { $unwind: "$achievements" },
            { $match: { "achievements.approved": true } },
            { $sort: { "achievements.createdAt": -1 } },
            {
                $group: {
                    _id: {
                        year: "$achievements.schoolYear",
                        semester: "$achievements.semester"
                    },
                    achievements: { $push: "$achievements" },
                    member: { $first: "$$ROOT" }
                }
            },
            { $sort: { "_id.year": -1, "_id.semester": -1 } }
        ]);

        if (!result.length) {
            const member = await Member.findById(memberId).lean();
            return { member, groups: {} };
        }

        const member = result[0].member;

        const groups = {};

        for (const row of result) {
            const year = row._id.year;
            const sem = row._id.semester;

            if (!groups[year]) groups[year] = {};
            if (!groups[year][sem]) groups[year][sem] = [];

            groups[year][sem].push(...row.achievements);
        }

        return { member, groups };
    }
}

module.exports = new ProfileService();
