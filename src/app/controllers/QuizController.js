const { json } = require("express");
const { default: mongoose } = require("mongoose");
const Question = require("../models/Question");
const { format } = require("morgan");
const Quiz = require("../models/Quiz");
const { isEmpty, checkEmptyForm, makeSlug } = require("../utils/lib/validate");
const { checkUser } = require("../middleware/authMiddleware");



class QuizController {

    //Get /Create
    // index(req, res) {
    //     res.render("create", { layout: false });
    // }

    index(req, res) {
        res.render("quiz/index");
    }

    createNewQuiz(req, res) {
        res.render("quiz/create");
    }

    async save(req, res) {
        try {
            const formData = req.body;
            var content = formData.question;
            var answerA = formData.answerA;
            var answerB = formData.answerB;
            var answerC = formData.answerC;
            var answerD = formData.answerD;
            var answer = formData.answer;
            var haveFile = formData.haveFile;

            console.log(formData);

            const quiz = new Quiz();
            quiz.name = formData.title;
            quiz.owner = req.user.email;

            // create unique slug for quiz
            var tmp_slug = quiz.name.replace(" ", "-");

            const isDuplicate = await Quiz.exists({ slug: tmp_slug }).exec();

            if (isDuplicate) {
                quiz.slug = makeSlug(quiz.name);
            }
            else {
                quiz.slug = tmp_slug;
            }

            quiz.save();

            var fileCount = 0;

            for (var i = 0; i < content.length; i++) {
                const question = new Question();
                question.quiz_id = quiz.id;


                question.question = content[i];
                question.answerA = answerA[i];
                question.answerB = answerB[i];
                question.answerC = answerC[i];
                question.answerD = answerD[i];
                question.answer = answer[i];

                if (haveFile[i] == 1) {
                    try {
                        const { image } = req.files;
                        var file = image[fileCount];
                        fileCount++;
                        if (file) {
                            if (file.mimetype.includes("image")) {
                                var arrName = file.name.split(".");
                                var ext = arrName[arrName.length - 1];
                                var name = question.id + "." + ext;
                                file.mv(__dirname + '/../../public/images/' + name);
                                question.image = name;
                            }
                        }
                    }
                    catch (e) {
                        question.image = "";
                    }
                }
                question.save();
            }

            res.redirect(`/library/view/${quiz.slug}`);

            // res.json(req.body);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new QuizController;