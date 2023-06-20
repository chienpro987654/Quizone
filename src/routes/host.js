const express = require('express');
const router = express.Router();

const hostController = require("../app/controllers/HostController");

const {requireAuth} = require('../app/middleware/authMiddleware');

router.get('/',requireAuth, hostController.index);
router.get('/start',hostController.start);
// router.get('/view/:slug',hostController.view);

module.exports = router;