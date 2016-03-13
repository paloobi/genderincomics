'use strict';

var mongoose = require('mongoose');
var Character = require('./character');
var counters = require('./counters');

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

schema.statics.calculate = function (publisher) {
    var stats = {publisher: publisher};
    Character.find({publisher: publisher})
    .then(function(characters){
        var numCharacters = characters.length;
        var numIssues = characters.reduce(function(sum, character){
            return sum + character.issueCount;
        }, 0)
        var average = numIssues / numCharacters;
        return this.find({publisher: publisher})
    })
    .then(function(stat) {
        if (!stat) return this.create(stats);
        else {
            stat.set(stats);
            return stat.save();
        }
    }
}

schema.statics.getByPublisher = counters.getByPublisher;

mongoose.model('GenderCount', schema);

module.exports = mongoose.model('GenderCount');