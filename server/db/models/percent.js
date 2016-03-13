'use strict';

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');

var Character = require('./character');

var schema = new mongoose.Schema({
    publisher: {
        type: String,
        required: true,
        unique: true
    },
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

schema.statics.findOverall = function() {
    return this.findOne({publisher: 'overall'})
}
  
schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher});
}

mongoose.model('Percent', schema);

module.exports = mongoose.model('Percent');