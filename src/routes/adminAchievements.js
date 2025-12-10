const router = require('express').Router();
const AdminAchievementController = require('../app/controllers/AdminAchievementController');
const { requireAdmin } = require('../app/middlewares/websession');

router.get("/", requireAdmin, AdminAchievementController.list);
router.get("/detail", requireAdmin, AdminAchievementController.detail);
router.post("/approve", requireAdmin, AdminAchievementController.approve);
router.post("/reject", requireAdmin, AdminAchievementController.reject);
router.post("/request-edit", requireAdmin, AdminAchievementController.requestEdit);

module.exports = router;
