const Member = require('../models/Members');

class AchievementService {
    async addMany(memberId, achievements) {
        return Member.updateOne(
            { _id: memberId },
            { $push: { achievements: { $each: achievements } } }
        );
    }
}

module.exports = new AchievementService();
