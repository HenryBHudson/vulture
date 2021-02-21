const mongoose = require('mongoose');

const markerSchema = new mongoose.Schema({
    text: String,
    colour: String
})

const Marker = mongoose.model('Marker', markerSchema);

module.exports = Marker;