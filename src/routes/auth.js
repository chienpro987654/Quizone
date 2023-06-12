const express = require('express');
const router = express.Router();

const authController = require("../app/controllers/AuthController");

router.get('/login',authController.login);
router.get('/signup',authController.signup);
router.get('/logout',authController.logout);

router.post('/login',authController.login_post);
router.post('/signup',authController.signup_post);
// router.get('/start/:slug',authController.start);
// router.get('/view/:slug',hostController.view);

module.exports = router;