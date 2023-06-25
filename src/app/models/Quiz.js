const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Quiz = new Schema({
    name: {type: String, require: true, maxLength: 255},
    description: {type: String, default: "", maxLength: 1000},
    slug: {type: String, unique: true},
    owner: {type: String},
    time_prepare: {type: Number, default: 10},
    time_waiting: {type: Number, default: 20},
},{
    timestamps: true,
})

module.exports = mongoose.model('Quiz',Quiz);