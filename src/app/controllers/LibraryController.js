const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const LiveGame = require("../models/LiveGame");
const { isEmpty } = require("../utils/lib/validate");

class LibraryController {
    index(req, res, next) {
        const email = req.user.email;
        Quiz.find({ owner: email }).sort([['createdAt', -1]])
            .then(quizzes => {
                quizzes = quizzes.map(quizzes => quizzes.toObject());
                // res.render('library/index', { quizzes });
                res.json({
                    status: "success",
                    data: {
                        quizzes: quizzes,
                    },
                })
            })
            .catch(next);
    }

    async view(req, res, next) {
        try {
            // var arrPath = req.path.split("/");
            // var _slug = arrPath[arrPath.length - 1];
            var id = req.query.id;
            var quiz = await Quiz.findOne({ _id: id });
            if (quiz) {
                var _quizId = quiz._id.toString();
                console.log("view", quiz);
                const questions = await Question.find({ quiz_id: _quizId }).sort([['order', 'asc']]);
                res.json({
                    status: "success",
                    data: {
                        quiz: quiz,
                        questions: questions,
                    },
                });

            }
        } catch (error) {
            console.log(error);
            res.json({
                status: "error",
                error: error,
            })
        }

        // console.log(doc);
        // res.render('library/view');
    }

    async listReport(req, res) {
        const quiz_id = req.query.id;
        // console.log(quiz_id);
        var liveGames = await LiveGame.find({ quiz_id: quiz_id, finished: true }).sort([['createdAt', 'desc']]);

        if (liveGames) {
            console.log("Live Game", liveGames);

            var reports = [];

            liveGames.forEach(element => {
                var report = {};
                report.id = element._id;
                report.createdAt = element.createdAt;
                // report.data = element.data;

                reports.push(report);
            });
            console.log("result", reports);
            res.json({
                status: "success",
                data: {
                    reports: reports,
                },
            });
        }
    }

    async viewReport(req, res) {
        try {
            const live_id = req.query.id;
            var doc = await LiveGame.findOne({ _id: live_id });
            if (doc) {
                const quiz_id = doc.quiz_id;
                var questions = await Question.find({ quiz_id: quiz_id }).sort([['order', 'asc']]);
                var orders = doc.mix;
                console.log(orders);
                var list_data = doc.data;
                var reports = [];
                if (isEmpty(orders)) {
                    questions.forEach(ques => {
                        var report = {};
                        report.question = ques;
                        report.data = [];
                        list_data.forEach(data => {
                            if (data.question == ques.order) {
                                var obj = { name: data.name, answer: data.answer, point: data.point };
                                report.data.push(obj);
                            }
                        });
                        reports.push(report);
                    });
                } else {
                    questions.forEach(ques => {
                        var report = {};
                        report.question = ques;
                        report.data = [];
                        list_data.forEach(data => {
                            console.log(orders[data.question],ques.order);
                            console.log(orders[data.question] == ques.order)
                            if (orders[data.question] == ques.order) {
                                var obj = { name: data.name, answer: data.answer, point: data.point };
                                report.data.push(obj);
                            }
                        });
                        console.log("report",report);
                        reports.push(report);
                    });
                }
                // var data = { id: doc._id, data: doc.data };
                res.json({
                    status: "success",
                    data: {
                        report: reports,
                    }
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

    async getTheme(req, res) {
        try {
            const quiz_id = req.query.id;
            var doc = await Quiz.findOne({ _id: quiz_id });
            console.log("get theme");
            if (doc) {
                res.json({
                    status: "success",
                    data: {
                        theme: doc.theme,
                    }
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

    async setFavorite(req, res) {
        try {
            const quiz_id = req.query.id;
            const value = req.query.value;
            var doc = await Quiz.findOne({ _id: quiz_id });
            console.log("Set Favor", quiz_id, value);
            if (doc) {
                doc.favorite = (value == "true") ? true : false;
                doc.save();
                res.json({
                    status: "success",
                    quiz: doc,
                });
            }
            else {
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
}

module.exports = new LibraryController;