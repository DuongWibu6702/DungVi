const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/UserController');

router.get('/login', AuthController.loginForm);
router.post('/login', AuthController.login);
router.get('/register', AuthController.registerForm);
router.post('/register', AuthController.register);
router.get('/logout', AuthController.logout);

module.exports = router;
