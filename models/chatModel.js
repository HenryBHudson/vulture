const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    members: [String],
    messages: [[String],[String]],
    code: String
})

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;