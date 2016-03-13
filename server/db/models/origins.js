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

schema.statics.calculate = function () {
    var stats = {};
    Character.find()
    .then(function(characters) {
      characters.forEach(function(character) {

        // add to overall
        if (!stats.overall) stats.overall = { publisher: "overall", female: [], male: [], other: [] };
        if (!stats.overall[char.gender][character.origins]) stats.overall[char.gender][character.origins] = 0;
        stats.overall[char.gender][character.origins]++;

        // add to publisher count
        if (char.publisher) {
            if (!stats[char.publisher]) stats[char.publisher] = { publisher: char.publisher, female: [], male: [], other: [] };
            if (!stats[char.publisher][char.gender][character.origins]) stats[char.publisher][char.gender][char.origins] = 0;
            stats[char.publisher][char.gender][char.origins]++;
        }

      });

    })
}

schema.statics.getOverall = function() {
    return this.findOne({publisher: 'overall'});
}
schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher});
}

mongoose.model('Origins', schema);

module.exports = mongoose.model('Origins');