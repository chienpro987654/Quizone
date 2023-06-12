const express = require('express');
const router = express.Router();

const libraryController = require("../app/controllers/LibraryController");

const {requireAuth} = require('../app/middleware/authMiddleware');

// router.get('/createNewQuiz',libraryController.createNewQuiz);
// router.post('/save',libraryController.save);
router.get('/',requireAuth, libraryController.index);
router.get('/view/:slug',requireAuth,libraryController.view);

module.exports = router;