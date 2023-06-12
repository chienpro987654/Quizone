const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Question = new Schema({
    quizId: String,
    image: String,
    question: {type: String, require: true, maxLength: 255},
    answerA: {type: String, require: true, maxLength: 255},
    answerB: {type: String, require: true, maxLength: 255},
    answerC: {type: String, require: true, maxLength: 255},
    answerD: {type: String, require: true, maxLength: 255},
});

module.exports = mongoose.model('Question',Question);