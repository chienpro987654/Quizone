const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Question = new Schema({
    quiz_id: String,
    image: String,
    question: {type: String, require: true, maxLength: 255},
    answerA: {type: String, require: true, maxLength: 255},
    answerB: {type: String, require: true, maxLength: 255},
    answerC: {type: String, require: true, maxLength: 255},
    answerD: {type: String, require: true, maxLength: 255},
    answer: {type: String, default: "A"},
    time_prepare: {type: Number, default: 10},
    time_waiting: {type: Number, default: 20},
});

module.exports = mongoose.model('Question',Question);