const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const LiveGame = new Schema({
    host_id: {type: String, require: true, maxLength: 255},
    quiz_id: {type: String, require: true, maxLength: 255},
    socket_id: {type: String, maxLength: 255},
    pin: {type: String, maxLength: 6},
    finished: {type: Boolean, default: false},
    running: {type: Boolean, default: false},
    mix: {type: Array, default: []},
    player: {type: Array, default: []},
    blocked_player: {type: Array, default: []},
    data: {type: Array, default: []},
},{
    timestamps: true,
})

module.exports = mongoose.model('LiveGame',LiveGame);