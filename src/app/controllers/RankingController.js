const RankingService = require('../services/RankingService');

class RankingController {
    // [GET] /ranking/year?year=
    async yearRanking(req, res) {
        try {
            const year = Number(req.query.year);

            if (!year) {
                return res.send("Thiếu tham số ?year=");
            }

            const ranking = await RankingService.getRankingByYear(year);

            res.render("ranking/rankings", {
                ranking,
                year,
                subjects: require('../constants/subjects')
            });

        } catch (e) {
            console.error(e);
            res.send("Có lỗi xảy ra.");
        }
    }
}

module.exports = new RankingController();
