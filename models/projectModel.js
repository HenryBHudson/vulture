const mongoose = require('mongoose');
const Card = require('./cardModel')

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required']
    },
    type: String,
    code: String,
    cards: {
        type: mongoose.Schema.Types.Object,
        ref: 'Card',
        default : {}
    },
    created: {
        date: [String],
        number: [Number]
    },
    tags: {
        type: Object,
        default : {}
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;