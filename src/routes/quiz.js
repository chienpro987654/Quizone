const express = require('express');
const router = express.Router();

const quizController = require("../app/controllers/QuizController");

const {requireAuth} = require('../app/middleware/authMiddleware');

router.get('/createNewQuiz',requireAuth,quizController.createNewQuiz);
router.post('/save',requireAuth,quizController.save);
router.get('/',requireAuth,quizController.index);

module.exports = router;