const express = require('express');
const router = express.Router();

const AdminController = require('../app/controllers/AdminController');
const { requireAdmin } = require('../app/middlewares/websession');

router.get('/:slug/login', AdminController.loginForm);
router.post('/:slug/login', AdminController.login);
router.get('/', requireAdmin, AdminController.dashboard);
router.get('/users', requireAdmin, AdminController.listUsers);
router.patch('/users/:id/toggle-active', requireAdmin, AdminController.toggleActive);
router.delete('/users/:id/delete', requireAdmin, AdminController.deleteUser);
router.patch('/users/:id/change-type', requireAdmin, AdminController.changeType);

module.exports = router;
