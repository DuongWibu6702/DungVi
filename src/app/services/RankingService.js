const Member = require('../models/Members');

class RankingService {

    async getRankingByYear(schoolYear) {
        const members = await Member.aggregate([
            { $unwind: "$achievements" },
            {
                $match: {
                    "achievements.approved": true,
                    "achievements.schoolYear": Number(schoolYear)
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    class: { $first: "$class" },

                    avgScore: { $avg: "$achievements.score" },

                    subjectScores: {
                        $push: {
                            subject: "$achievements.subject",
                            score: "$achievements.score"
                        }
                    }
                }
            }
        ]);

        const result = {
            primary: [],
            secondary: [],
            high: []
        };

        for (const m of members) {
            if (m.class <= 5) result.primary.push(m);
            else if (m.class <= 9) result.secondary.push(m);
            else result.high.push(m);
        }

        for (const key in result) {
            result[key].sort((a, b) => b.avgScore - a.avgScore);
        }

        return result;
    }
}

module.exports = new RankingService();
