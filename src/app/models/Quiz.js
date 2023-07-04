const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Quiz = new Schema({
    name: {type: String, require: true, maxLength: 255},
    description: {type: String, default: "", maxLength: 1000},
    slug: {type: String,slug: "name", unique: true},
    owner: {type: String},
    thumbnail_uri: {type: String,default: ""},
    theme: {type: String, default: ""},
},{
    timestamps: true,
})

module.exports = mongoose.model('Quiz',Quiz);