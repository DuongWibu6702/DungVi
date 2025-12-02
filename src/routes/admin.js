const express = require('express');
const router = express.Router();

const AdminController = require('../app/controllers/AdminController');
const { requireAdmin } = require('../app/middlewares/websession');

// ===== ADMIN LOGIN FORM =====
router.get('/:slug/login', AdminController.loginForm);
router.post('/:slug/login', AdminController.login);

// ===== DASHBOARD =====
router.get('/', requireAdmin, AdminController.dashboard);

// ===== ADMIN USER MANAGEMENT =====
router.get('/users', requireAdmin, AdminController.listUsers);
router.post('/users/:id/role', requireAdmin, AdminController.updateRole);

// ===== ADMIN LOGOUT =====
router.get('/logout', requireAdmin, AdminController.logout);

module.exports = router;
