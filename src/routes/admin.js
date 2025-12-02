const express = require('express');
const router = express.Router();

const AdminController = require('../app/controllers/AdminController');
const { requireAdmin } = require('../app/middlewares/websession');

router.get('/:slug/login', AdminController.loginForm);
router.post('/:slug/login', AdminController.login);
router.get('/', requireAdmin, AdminController.dashboard);
router.get('/users', requireAdmin, AdminController.listUsers);
router.post('/users/:id/role', requireAdmin, AdminController.updateRole);
router.get('/logout', requireAdmin, AdminController.logout);

module.exports = router;
