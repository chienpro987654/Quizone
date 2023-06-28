const quizRouter = require('./quiz');
const libraryRouter = require('./library');
const playRouter = require('./play');
const hostRouter = require('./host');
const authRouter = require('./auth');

const Quiz = require("../../src/app/models/Quiz");
const Question = require("../../src/app/models/Question");
const LiveGame = require("../../src/app/models/LiveGame");
const { isNumber, isEmpty } = require('../app/utils/lib/validate');
const { checkUser } = require('../app/middleware/authMiddleware');

const { Timer } = require('../app/utils/classes/timer');


function route(app) {
    app.get('*', checkUser);
    app.get("/", (req, res) => {
        res.render("home");
    })

    app.get("/home", (req, res) => {
        res.render("home");
    })

    // app.get("/create", (req, res) => {
    //     res.render("create", { layout: false });
    // })

    app.use("/quiz", quizRouter);
    app.use("/library", libraryRouter);
    app.use("/host", hostRouter);
    app.use("/play", playRouter);
    app.use("/auth", authRouter);

    let io = app.get("io");

    var timer = new Timer();


    io.on('connection', (socket) => {
        console.log("client connected: ", socket.id);

        socket.on("host_info_update", async (data) => {
            await LiveGame.findOneAndUpdate({ pin: data.pin }, { socket_id: socket.id });
            console.log(data);
        });

        //when player is waiting, if host close tab then redirect player to 'join' page
        socket.on("game_alive", async (data) => {
            var check = false;
            console.log("abc", data)
            const liveGame = await LiveGame.findOne({ pin: data });
            if (liveGame) {
                check = true;
            }
            socket.emit("game_alive", check);
        });

        //check pin when player press join button
        socket.on('player_join_req', async (info) => {
            console.log('pin: ' + info.pin);
            if (info.pin.length == 6 && isNumber(info.pin)) {
                var doc = await LiveGame.findOne({ pin: info.pin }).exec();
                if (doc) {
                    var players = doc.player;
                    if (players.includes(info.name)) {
                        // console.log("Name Bad");
                        socket.emit("player_join_res", { error: "This Name Is Used" });
                    }
                    else {
                        players = [...players, info.name]
                        console.log(players)
                        doc.player = players;
                        doc.save();
                        socket.emit("player_join_res", { name: info.name, pin: doc.pin });
                        io.emit("player_join_host", { name: doc.player });
                    }
                }
                else {
                    // console.log("Not Found");
                    socket.emit("player_join_res", { error: "Game Pin Not Found" });
                }
            }
            else {
                console.log("Not Valid");
                socket.emit("player_join_res", { error: "Game Pin Is Not Valid" });
            }
            // console.log(isExist);
        });

        //change status of live game when host press start button
        socket.on('host_start', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();

            // console.log(doc);
            // console.log(data.toString());
            if (doc) {
                doc.running = true;
                doc.save();
                io.emit("host_start", { pin: data.pin });
            }
        });

        socket.on('next_question_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            console.log(data);
            if (doc) {
                var questions = await Question.find({ quiz_id: doc.quiz_id });

                if (questions.length <= data.counter) {
                    socket.emit("next_question_res", "End");
                } else {
                    socket.emit("next_question_res", { pin: data.pin, question: questions[data.counter], length: questions.length });
                    timer.addTimer(data.pin, Date.now(), data.counter);
                    io.emit("next_question_res_player", { pin: data.pin, counter: data.counter, time_prepare: questions[data.counter].time_prepare });
                }

                // console.log("Show question");
            }
        });

        //data: name, pin, counter, answer
        socket.on("send_answer_req", async function (data) {
            if (data) {
                console.log(data);
                var doc = await LiveGame.findOne({ pin: data.pin }).exec();
                if (doc) {
                    var sCounter = data.counter;
                    var sName = data.name;
                    var sAnswer = data.answer;

                    if (isEmpty(doc.data)) {
                        console.log("counter", sCounter);

                        var questions = await Question.find({ quizId: doc.quiz_id });
                        var true_answer = questions[sCounter].answer;

                        var point = 0;

                        if (true_answer == sAnswer) {
                            var answerTime = Date.now();
                            var questionTime = timer.getTimer(data.pin, data.counter);
                            var time_prepare = questions[sCounter].time_prepare;
                            var time_waiting = questions[sCounter].time_waiting;

                            var tmpTime = Math.floor((answerTime - questionTime) / 1000);
                            point = (time_waiting - (tmpTime - time_prepare)) * 100;
                            console.log("timer1", answerTime);
                            console.log("timer1", questionTime);
                            console.log("timer1", tmpTime);
                            console.log("timer1", point);
                            console.log("timer", timer);

                            if (point == 0) {
                                socket.emit("send_answer_res",{result: false, point: point});
                            } else {
                                socket.emit("send_answer_res",{result: true, point: point});
                            }
                        }

                        obj = { answers: [{ "question": sCounter, "name": sName, "answer": sAnswer, "point": point }] };
                        console.log(obj);
                        var text = JSON.stringify(obj);
                        doc.data = text;
                        console.log(text);
                        doc.save();
                        console.log("Empty");
                    } else {
                        var obj = JSON.parse(doc.data);
                        var change = 0;
                        for (i in obj.answers) {
                            console.log(i);
                            if (obj.answers[i].name == data.name) {
                                obj.answers[i].answer = data.answer;
                                change = 1;
                                console.log("Change");
                            }
                        }

                        if (change == 0) {
                            var tmp1 = data.counter;
                            var tmp2 = data.name;
                            var tmp3 = data.answer;

                            var questions = await Question.find({ quizId: doc.quiz_id });
                            var true_answer = questions[sCounter].answer;

                            var point = 0;

                            if (true_answer == sAnswer) {
                                var answerTime = Date.now();
                                var questionTime = timer.getTimer(data.pin, data.counter);
                                var time_prepare = questions[sCounter].time_prepare;
                                var time_waiting = questions[sCounter].time_waiting;

                                var tmpTime = Math.floor((answerTime - questionTime) / 1000);
                                point = (time_waiting - (tmpTime - time_prepare)) * 100;
                                console.log("timer1", answerTime);
                                console.log("timer1", questionTime);
                                console.log("timer1", tmpTime);
                                console.log("timer1", point);
                            }

                            if (point == 0) {
                                socket.emit("send_answer_res",{result: false, point: point});
                            } else {
                                socket.emit("send_answer_res",{result: true, point: point});
                            }

                            var newObj = { "question": tmp1, "name": tmp2, "answer": tmp3, "point": point };
                            obj.answers.push(newObj);
                            console.log("Not Change");
                        }
                        var text = JSON.stringify(obj);
                        doc.data = text;
                        console.log(text);
                        doc.save();
                    }
                }

            }
        });

        //data: pin, counter
        socket.on('result_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            if (doc) {

                var questions = await Question.find({ quizId: doc.quiz_id });

                answer = questions[data.counter].answer;

                var counterA = 0;
                var counterB = 0;
                var counterC = 0;
                var counterD = 0;
                if (!isEmpty(doc.data)) {
                    obj = JSON.parse(doc.data);
                    console.log(obj);
                    for (i in obj.answers) {
                        console.log(i);
                        if (obj.answers[i].answer == "A") {
                            counterA++;
                        }
                        if (obj.answers[i].answer == "B") {
                            counterB++;
                        }
                        if (obj.answers[i].answer == "C") {
                            counterC++;
                        }
                        if (obj.answers[i].answer == "D") {
                            counterD++;
                        } obj.answers[i].answer
                    }
                }

                socket.emit("result_res", { pin: data.pin, counterA: counterA, counterB: counterB, counterC: counterC, counterD: counterD, answer: answer });
                io.emit("result_res_player",{pin: data.pin});
            }
        });

        socket.on('final_result_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            var result = [];
            if (doc) {
                var obj = JSON.parse(doc.data);
                for (i in obj.answers) {
                    // if (obj.answers[i].name == )
                    var name = obj.answers[i].name;
                    if (result[name] === null) {
                        result[name] = obj.answers[i].point;
                    }
                    else {
                        result[name] += obj.answers[i].point;
                    }
                }
            }
            socket.emit("final_result_res", { result });
        });

        socket.on('disconnect', async function () {
            // action on user disconnect
            // socket.broadcast.to(socket.chatroom).emit('user disconnect', name);
            var doc = await LiveGame.findOne({ socket_id: socket.id }).exec();
            if (doc) {
                console.log("host_disconnect: ", socket.id);
                if (doc.running == false) {
                    if (doc.finished == false) {
                        doc.delete();
                        console.log("delete game");
                        io.emit("host_disconnect", doc.pin);
                    }
                    else {
                        //game finished so delete pin from that game
                        io.emit("host_disconnect", doc.pin);
                        doc.pin = 0;
                        doc.save();
                    }
                }
            } else {
                console.log("client disconnected: ", socket.id);
            }
            socket.disconnect();
        });

    });
}

module.exports = route;