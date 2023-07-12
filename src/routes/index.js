const quizRouter = require('./quiz');
const libraryRouter = require('./library');
const playRouter = require('./play');
const hostRouter = require('./host');
const authRouter = require('./auth');

const Quiz = require("../../src/app/models/Quiz");
const Question = require("../../src/app/models/Question");
const LiveGame = require("../../src/app/models/LiveGame");
const { isNumber, isEmpty, isArrayEqual } = require('../app/utils/lib/validate');
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
                    var blocked_players = doc.blocked_player;
                    if (players.includes(info.name)) {
                        // console.log("Name Bad");
                        socket.emit("player_join_res", { error: "This Name Is Used" });
                    }
                    else if (blocked_players.includes(info.name)) {
                        socket.emit("player_join_res", { error: "You Can Not Join This Game" });
                    } else {
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

        //data: pin, name
        socket.on('kick_player_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            if (doc) {
                var list_player = doc.player;
                var blocked_players = doc.blocked_player;
                list_player.forEach((element, index) => {
                    if (element == data.name) {
                        list_player.splice(index, 1);
                        blocked_players.push(element);
                    }
                });
                doc.player = list_player;
                doc.blocked_player = blocked_players;
                doc.save();
                io.emit("kick_player_res", { pin: data.pin, name: data.name });
            }
        });

        //change status of live game when host press start button
        socket.on('host_start', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();

            console.log("host_start", data.pin);
            if (doc) {
                doc.running = true;
                doc.save();
                if (data.mix == true) {
                    console.log("mix question");
                    const count = await Question.count({ quiz_id: doc.quiz_id });
                    const original_array = Array.from({ length: count }, (_, i) => i.toString());
                    var mixed_array = [...original_array];
                    while (isArrayEqual(original_array,mixed_array)){
                        // Fisher-Yates shuffle algorithm
                        for (let i = mixed_array.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [mixed_array[i], mixed_array[j]] = [mixed_array[j], mixed_array[i]];
                        }
                    }
                    await LiveGame.findOneAndUpdate({ pin: data.pin },{mix: mixed_array}).exec();
                    socket.emit("host_start_res", { pin: data.pin });
                }
                io.emit("host_start", { pin: data.pin });
            }
        });

        socket.on('next_question_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            if (doc) {
                var questions = await Question.find({ quiz_id: doc.quiz_id }).sort([['order', 'asc']]);;

                if (questions.length <= data.counter) {
                    socket.emit("next_question_res", "End");
                } else {
                    // console.log("next_ques_req",doc.mix,doc.mix[0]);
                    console.log("next_ques_req",doc);
                    if (!isEmpty(doc.mix)) {
                        socket.emit("next_question_res", { pin: data.pin, question: questions[doc.mix[data.counter]], length: questions.length });
                        timer.addTimer(data.pin, Date.now(), data.counter);
                        io.emit("next_question_res_player", { pin: data.pin, counter: data.counter, time_prepare: questions[doc.mix[data.counter]].time_prepare, type: questions[doc.mix[data.counter]].type });
                    } else {
                        socket.emit("next_question_res", { pin: data.pin, question: questions[data.counter], length: questions.length });
                        timer.addTimer(data.pin, Date.now(), data.counter);
                        io.emit("next_question_res_player", { pin: data.pin, counter: data.counter, time_prepare: questions[data.counter].time_prepare, type: questions[data.counter].type });
                    }
                }
                // console.log("Show question");
            }
        });

        //data: name, pin, counter, answer
        socket.on("send_answer_req", async function (data) {
            if (data) {
                console.log("send_answer_req", data);
                var doc = await LiveGame.findOne({ pin: data.pin }).exec();
                if (doc) {
                    var sCounter = data.counter;
                    var sName = data.name;
                    var sAnswer = data.answer;

                    var aData = doc.data;

                    console.log("Save Answer with: ", sCounter, sName, sAnswer);

                    var questions = await Question.find({ quiz_id: doc.quiz_id }).sort([['order', 'asc']]);
                    var true_answer = (isEmpty(doc.mix)) ? questions[sCounter].answer : questions[doc.mix[sCounter]].answer;

                    var point = 0;

                    console.log(questions[doc.mix[sCounter]]);
                    console.log("answer", sAnswer, true_answer);

                    if (true_answer == sAnswer) {
                        var answerTime = Date.now();
                        var questionTime = timer.getTimer(data.pin, data.counter);
                        var time_prepare = questions[sCounter].time_prepare;
                        var time_waiting = questions[sCounter].time_waiting;

                        var tmpTime = Math.floor((answerTime - questionTime) / 1000);
                        point = (time_waiting - (tmpTime - time_prepare)) * 100;
                        // console.log("timer1", answerTime);
                        // console.log("timer1", questionTime);
                        // console.log("timer1", tmpTime);
                        // console.log("timer1", point);
                        // console.log("timer", timer);

                    }

                    var newObj = { "question": sCounter, "name": sName, "answer": sAnswer, "point": point };

                    aData.push(newObj);
                    doc.data = aData;
                    console.log("live game after save point: ", doc.data);
                    doc.save();

                    if (point == 0) {
                        socket.emit("send_answer_res", { result: false, point: point });
                    } else {
                        socket.emit("send_answer_res", { result: true, point: point });
                    }
                }
            }
        });

        //data: pin, counter
        socket.on('result_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            if (doc) {

                var questions = await Question.find({ quiz_id: doc.quiz_id });

                answer = questions[data.counter].answer;

                var sCounter = data.counter;

                var counterA = 0;
                var counterB = 0;
                var counterC = 0;
                var counterD = 0;

                var aData = doc.data;

                aData.forEach(function (item) {
                    if (item.answer == "A" && item.question == sCounter) {
                        counterA++;
                    }
                    if (item.answer == "B" && item.question == sCounter) {
                        counterB++;
                    }
                    if (item.answer == "C" && item.question == sCounter) {
                        counterC++;
                    }
                    if (item.answer == "D" && item.question == sCounter) {
                        counterD++;
                    }
                });

                socket.emit("result_res", { pin: data.pin, counterA: counterA, counterB: counterB, counterC: counterC, counterD: counterD, answer: answer });
                io.emit("result_res_player", { pin: data.pin });
            }
        });

        //data: pin
        socket.on('final_result_req', async function (data) {
            var doc = await LiveGame.findOne({ pin: data.pin }).exec();
            var aResult = [];
            if (doc) {
                var aData = doc.data;

                aData.forEach(function (item) {
                    var num = -1;
                    aResult.forEach(function (item2, index) {
                        if (item2.name === item.name) {
                            num = index;
                        }
                    });
                    if (num === -1) {
                        var result = {};
                        result.name = item.name;
                        if (result.point == null) {
                            result.point = item.point;
                        } else {
                            result.point += item.point;
                        }
                        aResult.push(result);
                    } else {
                        aResult[num].point += item.point;
                    }
                });

                doc.finished = true;
                doc.running = false;
                doc.save();

                console.log(aResult);
                var topResult = [...aResult].sort((first, second) => second.point - first.point).splice(0, 3);
                console.log(topResult);
            }
            socket.emit("final_result_res", { result: topResult });
            io.emit("final_result_res_player", { pin: data.pin, result: aResult });
        });

        socket.on('disconnect', async function () {
            // action on user disconnect
            // socket.broadcast.to(socket.chatroom).emit('user disconnect', name);
            var doc = await LiveGame.findOne({ socket_id: socket.id }).exec();
            if (doc) {
                console.log("host_disconnect: ", socket.id);
                if (doc.finished == false) {
                    console.log("delete game due to reload or bad connection", doc.pin);
                    io.emit("host_disconnect", doc.pin);
                    doc.delete();
                }
                else {
                    //game finished so delete pin from that game
                    io.emit("host_disconnect after finishing", doc.pin);
                    doc.pin = 0;
                    doc.save();
                }
            } else {
                console.log("client disconnected: ", socket.id);
            }
            socket.disconnect();
        });

    });
}

module.exports = route;