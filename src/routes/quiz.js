const express = require('express');
const multer = require('multer');
const upload = multer();

const router = express.Router();

const quizController = require("../app/controllers/QuizController");

const {requireAuth} = require('../app/middleware/authMiddleware');

router.get('/createNewQuiz',requireAuth,quizController.createNewQuiz);
router.post('/save',requireAuth,quizController.save);
router.post('/saveExcel',upload.single('file'),requireAuth,quizController.save_excel);
router.get('/',requireAuth,quizController.index);

module.exports = router;