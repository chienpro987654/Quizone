const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const LiveGame = require("../models/LiveGame");

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
            var _id = req.params.id;
            var quiz = await Quiz.findOne({ id: _id });
            if (quiz) {
                console.log(quiz);
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
            // var quiz = await Quiz.findOne({ _id: quiz_id});

            // results.quiz = quiz;


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
            const quiz_id = req.query.id;
            var doc = await LiveGame.findOne({ id: quiz_id });
            if (doc) {
                var data = { id: doc._id, data: doc.data };
                res.json({
                    status: "success",
                    data: {
                        report: data,
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
}

module.exports = new LibraryController;