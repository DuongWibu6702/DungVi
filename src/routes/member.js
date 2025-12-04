const express = require('express');
const router = express.Router();
const MemberController = require('../app/controllers/MemberController');

router.get('/login', MemberController.loginForm);
router.post('/login', MemberController.login);
router.get('/register', MemberController.registerForm);
router.post('/register', MemberController.register);
router.get('/profile', MemberController.profile);
router.post('/profile', MemberController.updateProfile);
router.get('/password', MemberController.password);
router.post('/password', MemberController.updatePassword);
router.post('/verify-password', MemberController.verifyPassword);

module.exports = router;
