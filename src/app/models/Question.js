const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Question = new Schema({
    quiz_id: String,
    order: {type: Number, default: 0},
    image_uri: {type: String, default: ""},
    question: {type: String, require: true, maxLength: 255},
    answerA: {type: String, maxLength: 255},
    answerB: {type: String, maxLength: 255},
    answerC: {type: String, maxLength: 255},
    answerD: {type: String, maxLength: 255},
    answer: {type: String, default: "A"},
    time_prepare: {type: Number, default: 10},
    time_waiting: {type: Number, default: 20},
},{
    timestamps: true,
});

module.exports = mongoose.model('Question',Question);