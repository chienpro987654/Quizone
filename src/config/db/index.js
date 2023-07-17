const mongoose = require('mongoose');

function connect() {
    try {
        mongoose.connect('Add your database here');
        console.log("Connect successfully!");
    }
    catch (error) {
        console.log("Connect failed!");
    }

}

module.exports = { connect };