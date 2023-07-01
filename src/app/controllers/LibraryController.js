const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

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
            var arrPath = req.path.split("/");
            var _slug = arrPath[arrPath.length - 1];
            // var _id = req.params.id;
            Quiz.findOne({ slug: _slug }).lean().exec( async function (err, quiz) {
                if (err){
                    res.json({
                        status: "error",
                        error,
                    });
                }

                // console.log(quiz);
                var _quizId = quiz._id.toString();
                console.log("view",quiz);
                const questions = await Question.find({ quiz_id: _quizId }).sort([['order', 'asc']]);
                res.json({
                    status: "success",
                    data: {
                        quiz: quiz,
                        questions: questions,
                    },
                });

            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "success",
                error: error,
            })
        }

        // console.log(doc);
        // res.render('library/view');
    }
}

module.exports = new LibraryController;