const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');

router.get('/login', UserController.loginForm);
router.post('/login', UserController.login);
router.get('/register', UserController.registerForm);
router.post('/register', UserController.register);
router.get('/profile', UserController.profile);
router.post('/profile', UserController.updateProfile);
router.get('/logout', UserController.logout);

module.exports = router;
