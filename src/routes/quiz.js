const express = require('express');
const multer = require('multer');
const upload = multer();

const router = express.Router();

const quizController = require("../app/controllers/QuizController");

const {requireAuth} = require('../app/middleware/authMiddleware');

//get method
router.get('/createNewQuiz',requireAuth,quizController.createNewQuiz);
// router.get('/update/',requireAuth,quizController.createNewQuiz);
router.get('/',requireAuth,quizController.index);

//post method
router.post('/save',upload.any(),requireAuth,quizController.save);
router.post('/saveExcel',upload.single('file'),requireAuth,quizController.save_excel);
router.post('/update',requireAuth,quizController.update);
router.post('/delete',requireAuth,quizController.delete);


module.exports = router;