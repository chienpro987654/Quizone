const mongoose = require('mongoose');

function connect() {
    try {
        mongoose.connect('mongodb://127.0.0.1/quizer_dev');
        console.log("Connect successfully!");
    }
    catch (error) {
        console.log("Connect failed!");
    }

}

module.exports = { connect };