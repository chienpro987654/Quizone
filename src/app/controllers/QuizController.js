const { json } = require("express");
const { default: mongoose } = require("mongoose");
const Question = require("../models/Question");
const { format } = require("morgan");
const Quiz = require("../models/Quiz");
const {
    isEmpty,
    checkEmptyForm,
    makeSlug,
    validateSheet,
} = require("../utils/lib/validate");
const { checkUser } = require("../middleware/authMiddleware");
const xlsx = require("xlsx");
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
            const jsonData = req.body.data;
            // console.log("json", jsonData.data);

            const quiz = new Quiz();
            quiz.name = jsonData.title;
            quiz.description = jsonData.description;
            quiz.thumbnail_uri = jsonData.thumbnailUri;
            quiz.theme = jsonData.theme;
            quiz.owner = req.user.email;

            quiz.save();
            // console.log("quiz",quiz);

            var questions = jsonData.questions;

            // console.log("ques", questions);

            var counter = 0;
            questions.forEach((element) => {
                const question = new Question();
                question.quiz_id = quiz.id;
                question.order = counter;
                question.question = element.question;
                question.answerA = element.selections[0];
                question.answerB = element.selections[1];
                question.answerC = element.selections[2];
                question.answerD = element.selections[3];
                question.answer = element.answer;
                question.image_uri = element.imageUri;
                question.time_prepare = element.readingTime;
                question.time_waiting = element.timeLimit;

                counter++;

                question.save();
                // console.log(question.question,question);
            });

            res.json({
                status: "success",
                data: {
                    quiz,
                },
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "error",
                error: error,
            });
        }
    }

    async save_excel(req, res) {
        try {
            // const { file }  = req.files;
            console.log("run");
            console.log(req.file);
            if (req.file) {
                const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = xlsx.utils.sheet_to_json(worksheet, {
                    header: "A",
                });

                console.log("data excel", jsonData);
                var test = validateSheet(jsonData);
                console.log(test);
                if (!test) {
                    res.json({
                        status: "error",
                        error: "Invalid Format",
                    });
                }

                const quiz = new Quiz();
                for (var i = 0; i < jsonData.length; i++) {
                    var name = 0;
                    var des = 0;
                    if (jsonData[i].A == "name") {
                        quiz.name = jsonData[i].B;
                        name = 1;
                    }

                    if (jsonData[i].A == "description") {
                        quiz.description = jsonData[i].B;
                        des = 1;
                    }
                    if (name && des) {
                        break;
                    }
                }

                quiz.save();
                console.log(quiz);

                for (var i = 0; i < jsonData.length; i++) {
                    if (jsonData[i].A == "question") {
                        const question = new Question();
                        question.quiz_id = quiz.id;
                        question.question = jsonData[i].B;
                        question.answerA = jsonData[i + 1].B;
                        question.answerB = jsonData[i + 2].B;
                        question.answerC = jsonData[i + 3].B;
                        question.answerD = jsonData[i + 4].B;
                        question.answer = jsonData[i + 5].B;
                        i = i + 5;
                        question.save();
                        console.log(question);
                    }
                }
                res.json({
                    status: "success",
                    data: {
                        quiz: quiz,
                    },
                });
            }
        } catch (error) {
            console.log(error);
            res.json({
                status: "error",
                error: error,
            });
        }
    }

    async update(req, res) {
        try {
            const id = req.params.id;
            var doc = await Quiz.findOne({ id: id }).exec();
            if (doc) {
                const formData = req.body;
                quiz.title = formData.title;

                var content = formData.question;
                var answerA = formData.answerA;
                var answerB = formData.answerB;
                var answerC = formData.answerC;
                var answerD = formData.answerD;
                var answer = formData.answer;
                var image = formData.image;

                var questions = await Question.find({ quiz_id: doc.id });
            } else {
                console.log(error);
                res.json({
                    status: "error",
                    error: "Document Not Found",
                });
            }
        } catch (error) {
            console.log(error);
            res.json({
                status: "error",
                error: error,
            });
        }
    }

    async delete(req, res) {
        try {
            const _id = req.query.id;
            console.log(req.query);
            if (_id) {
                var doc = await Quiz.findOne({ _id: _id }).exec();
                if (doc) {
                    console.log("delete", doc);
                    doc.delete();
                    await Question.deleteMany({ quiz_id: _id });
                    res.json({
                        status: "success",
                        data: "Delete Successfully",
                    });
                } else {
                    console.log(error);
                    res.json({
                        status: "error",
                        error: "Document Not Found",
                    });
                }
            } else {
                console.log(error);
                res.json({
                    status: "error",
                    error: "Invalid Request",
                });
            }
        } catch (error) {
            console.log(error);
            res.json({
                status: "error",
                error: error,
            });
        }
    }
}

module.exports = new QuizController();
