const express = require('express');
const router = express.Router();

const playController = require("../app/controllers/PlayController");

router.get('/start',playController.start);
router.get('/join',playController.join);
router.get('/waiting',playController.waiting);
// router.get('/:slug',playController.play);
router.get('/',playController.index);

module.exports = router;