const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const User = new Schema({
    // username: {type: String, require: true},
    email:  {type: String, unique: true, lowercase: true, require: true, isEmail: true},
    password: {type: String, require: true},
})

User.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

User.statics.login = async function (email,password){
    const user = await this.findOne({email});
    if (user){
        const auth = bcrypt.compare(password, user.password);
        if (auth){
            return user;
        }
        throw Error('Validation failed');
    }
    throw Error('Validation failed');
}

module.exports = mongoose.model('User',User);