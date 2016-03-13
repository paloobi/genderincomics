'use strict';

var mongoose = require('mongoose');
var Character = require('./character');

var schema = new mongoose.Schema({
    publisher: String,
    female: {
        type: Number,
        required: true
    },
    male: {
        type: Number,
        required: true
    },
    other: {
        type: Number,
        required: true
    }    
});

schema.statics.getOverall = function() {
    return this.findOne({publisher: 'overall'});
}

schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher})
}

mongoose.model('Issues', schema);

module.exports = mongoose.model('Issues');