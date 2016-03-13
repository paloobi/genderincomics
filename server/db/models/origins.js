'use strict';

var mongoose = require('mongoose');
var Character = require('./character');
var counters = require('./counters');

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

schema.statics.calculate = function (publisher) {
    var stats = {publisher: publisher};
    Character.find({publisher: publisher})
    .then(function(characters) {
      characters.forEach(function(character) {
        if (!stats[character.origins]) stats[character.origins] = 0;
        stats[character.origins]++;
      });
      
    })
}
schema.statics.getByPublisher = counters.getByPublisher;

mongoose.model('Origins', schema);

module.exports = mongoose.model('Origins');