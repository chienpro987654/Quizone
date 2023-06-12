const { json } = require("express");
const { default: mongoose } = require("mongoose");
const Question = require("../models/Question");
const { format } = require("morgan");
const Quiz = require("../models/Quiz");
const { isEmpty, checkEmptyForm, makeSlug } = require("../utils/lib/validate");



class QuizController {

    //Get /Create
    // index(req, res) {
    //     res.render("create", { layout: false });
    // }

    index(req, res) {
        res.render("quiz/quiz");
    }

    createNewQuiz(req, res) {
        res.render("quiz/createNewQuiz");
    }

    async save(req, res) {
        const formData = req.body;
        var content = formData.question;
        var answerA = formData.answerA;
        var answerB = formData.answerB;
        var answerC = formData.answerC;
        var answerD = formData.answerD;

        var check = checkEmptyForm(content, answerA, answerB, answerC, answerD);

        if (check) {

            const quiz = new Quiz();
            quiz.name = formData.title;
            quiz.owner = "chien";

            //create unique pin for quiz
            // while (true) {
            //     var number = Math.floor(Math.random() * 999999) + 100000;
            //     var isDuplicate = await Quiz.exists({ pin: number }).exec();
            //     if (!isDuplicate) {
            //         quiz.pin = number;
            //         break;
            //     }
            // }

            // create unique slug for quiz
            var tmp_slug = quiz.name.replace(" ", "-");

            isDuplicate = await Quiz.exists({ slug: tmp_slug }).exec();

            if (isDuplicate) {
                quiz.slug = makeSlug(quiz.name);
            }
            else {
                quiz.slug = tmp_slug;
            }

            quiz.save();

            const question = new Question(formData);
            question.quizId = quiz.id;

            try
            {
                const { image } = req.files;
                if (image) {
                    if (image && /^image/.test(image.mimetype)) {
                        var arrName = image.name.split(".");
                        var ext = arrName[arrName.length - 1];
                        var name = question.id + "." + ext;
                        image.mv(__dirname + '../../../public/images/' + name);
                        question.image = name;
                    }
                }
            }
            catch (e)
            {
                question.image = "";
            }


            question.save();

            res.redirect(`/library/view/${quiz.slug}`);
        }

        // console.log(ext);

        // res.json(req.body);
    }
}

module.exports = new QuizController;