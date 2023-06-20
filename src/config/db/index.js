const mongoose = require('mongoose');

function connect() {
    try {
        mongoose.connect('mongodb+srv://chienpro987654:Esd123456@clusterquizone.ns4djab.mongodb.net/');
        console.log("Connect successfully!");
    }
    catch (error) {
        console.log("Connect failed!");
    }

}

module.exports = { connect };