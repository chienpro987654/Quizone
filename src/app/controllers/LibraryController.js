const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

class LibraryController {
    index(req, res, next) {
        Quiz.find({})
            .then(quizzes => {
                quizzes = quizzes.map(quizzes => quizzes.toObject());
                res.render('library/index', { quizzes });
            })
            .catch(next);
    }

    view(req, res, next) {
        try {
            var arrPath = req.path.split("/");
            var _slug = arrPath[arrPath.length - 1];
            Quiz.findOne({ slug: _slug }).lean().exec(function (err, doc) {
                var quiz = doc;
                // console.log(quiz);
                var _quizId = quiz._id.toString();
                console.log(_quizId);
                Question.find({ quiz_id: _quizId })
                    .then(questions => {
                        questions = questions.map(questions => questions.toObject());
                        console.log(questions);
                        res.render('library/view', { questions, quiz });
                    })
                    .catch(next);

            });
        } catch (error) {
            console.log(error);
        }

        // console.log(doc);
        // res.render('library/view');
    }
}

module.exports = new LibraryController;