const ProfileService = require('../services/ProfileService');

class ProfileController {
    async show(req, res) {
        try {
            const { id } = req.params;

            const profileData = await ProfileService.getProfile(id);

            return res.render("profile/view", {
                profile: profileData.member,
                groups: profileData.groups
            });

        } catch (e) {
            console.error(e);
            res.send("Có lỗi xảy ra.");
        }
    }
}

module.exports = new ProfileController();
