const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    summary: String,
    description: String,
    tags: Array,
    urgency: String,
    id: String,
    panel: String,
    flags: [String]
});
const Card = mongoose.model('Card', cardSchema);

module.exports = Card;