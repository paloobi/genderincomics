'use strict';

var mongoose = require('mongoose');
var Character = require('./character');

var countObj = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
})

var schema = new mongoose.Schema({
    publisher: String,
    female: {
        type: [countObj],
        required: true
    },
    male: {
        type: [countObj],
        required: true
    },
    other: {
        type: [countObj],
        required: true
    }
});

schema.statics.getOverall = function() {
    return this.findOne({publisher: 'overall'});
}
schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher});
}

mongoose.model('Names', schema);

module.exports = mongoose.model('Names');