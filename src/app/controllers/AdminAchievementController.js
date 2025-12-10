const AdminAchievementService = require('../services/AdminAchievementService');

class AdminAchievementController {

    async list(req, res) {
        const submissions = await AdminAchievementService.listSubmissions();
        res.render("admin/achievements/list", { submissions });
    }

    async detail(req, res) {
        const { id } = req.query;
        const detail = await AdminAchievementService.getSubmission(id);
        res.render("admin/achievements/detail", { detail });
    }

    async approve(req, res) {
        const { id } = req.body;
        await AdminAchievementService.approve(id);
        res.redirect("/admin/achievements");
    }

    async reject(req, res) {
        const { id } = req.body;
        await AdminAchievementService.reject(id);
        res.redirect("/admin/achievements");
    }

    async requestEdit(req, res) {
        const { id } = req.body;
        await AdminAchievementService.requestEdit(id);
        res.redirect("/admin/achievements");
    }
}

module.exports = new AdminAchievementController();
