const Quiz = require("../models/Quiz");
const Question = require("../models/Question");


class PlayController {
    index(req, res, next) {
        res.render("play/join");
    }

    join(req, res) {
        res.render("play/join");
    }

    waiting(req, res, next) {
        try {
            if (req.params.pin) {
                const liveGame = LiveGame.find({pin: req.params.pin});
                if (liveGame){
                    res.render("play/waiting");
                } else {
                    res.redirect("play/join");
                }
            }
        } catch (error) {
            console.log(error);
        }
        res.render("play/waiting");
    }

    async play(req, res, next) {
        // console.log(req.params.slug);
        try {
            if (req.params.pin) {
                const liveGame = LiveGame.find({pin: req.params.pin});
                if (liveGame){
                    res.render("play/index");
                } else {
                    res.status(404).send("Not found.");
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = new PlayController;