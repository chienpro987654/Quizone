const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Quiz = new Schema({
    name: {type: String, require: true, maxLength: 255},
    slug: {type: String, unique: true},
    owner: {type: String},
    // pin: {type: Number, maxLength: 6},
    // running: {type: Boolean, default: false},
},{
    timestamps: true,
})

module.exports = mongoose.model('Quiz',Quiz);