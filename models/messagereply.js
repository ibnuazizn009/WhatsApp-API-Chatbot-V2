var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var msg_reply = new Schema({
    keyword: {
        type : String,
        required: true,
    },
    message: {
        type : String,
    },
    contentType: {
        type: String,
    },
    filename: {
        type: String,
    },
    replyimage: {
        type: String,
    }
}, { collection: 'msg_reply'});

module.exports = mongoose.model('msg_reply', msg_reply);