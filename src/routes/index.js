const quizRouter = require('./quiz');
const libraryRouter = require('./library');
const playRouter = require('./play');
const hostRouter = require('./host');
const authRouter = require('./auth');

const Quiz = require("../../src/app/models/Quiz");
const Question = require("../../src/app/models/Question");
const LiveGame = require("../../src/app/models/LiveGame");
const { isNumber } = require('../app/utils/lib/validate');
const { checkUser } = require('../app/middleware/authMiddleware');

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

    io.on('connection', (socket) => {
        console.log("client connected: ", socket.id);
        socket.on("host_info_update", async (data) => {
            await LiveGame.findOneAndUpdate({ pin: data.pin }, { socket_id: socket.id });

            console.log(data);
        });

        socket.on("game_alive", async (data) => {
            var check = false;
            console.log(data)
            const liveGame = await LiveGame.findOne({ pin: data });
            if (liveGame) {
                check = true;
            }
            socket.emit("game_alive", check);
        });

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
                    else{
                        players = players.concat(info.name);
                        console.log(players)
                        doc.player = players;
                        doc.save();
                        socket.emit("player_join_res", { name: info.name, pin: doc.pin });
                        io.emit("player_join_host", { name: info.name });
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


        socket.on('disconnect', async function () {
            // action on user disconnect
            // socket.broadcast.to(socket.chatroom).emit('user disconnect', name);
            var doc = await LiveGame.findOne({ socket_id: socket.id }).exec();
            if (doc) {
                if (doc.finished != true) {
                    io.emit("host_disconnect", doc.pin);
                    doc.delete();
                    console.log("host_disconnect: ", socket.id);
                }
                else {
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