const Quiz = require("../models/Quiz");
const LiveGame = require("../models/LiveGame");
// const Question = require("../models/Question");

const { isEmpty } = require('../utils/lib/validate');

class HostController {
    async index(req, res, next) {
        try {
            // console.log(req.query);
            var quiz_id = req.query.quizId;
            if (!isEmpty(quiz_id)) {
                const doc = await Quiz.findOne({ id: quiz_id });
                if (doc) {
                    //create a live game
                    const liveGame = new LiveGame();
                    if (res.locals.user){
                        liveGame.host_id = res.locals.user.id;
                    }
                    while (true) {
                        var number = Math.floor(Math.random() * 899999) + 100001;
                        var isDuplicate = await LiveGame.exists({ pin: number }).exec();
                        if (!isDuplicate) {
                            liveGame.pin = number;
                            break;
                        }
                    }
                    // var doc = await Quiz.exists({ id: quiz_id }).exec();
                    liveGame.quiz_id = quiz_id;
                    liveGame.save();

                    res.render("host/index", { quizId: quiz_id, pin: liveGame.pin });
                } else {
                    res.status(404).send("Not found.");
                }
            } else {
                res.status(404).send("The URL is invalid.");
            }
        } catch (error) {
            console.log(error);
        }
    }

    async start(req, res, next) {
        try {
            var quiz_id = req.query.quizId;
            var pin = req.query.pin;
            if (!isEmpty(quiz_id)){
                const doc = await Quiz.findOne({ id: quiz_id });
                if (doc) {
                    res.render("host/start", {quiz: doc, pin: pin});
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new HostController;

