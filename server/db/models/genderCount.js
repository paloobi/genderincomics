'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    female: {
        type: Number
    },
    male: {
        type: Number
    },
    other: {
        type: Number
    }
});


mongoose.model('GenderCount', schema);

module.exports = mongoose.model('GenderCount');