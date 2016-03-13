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

// used to seed DB with calculations from Character model
schema.statics.calculate = function () {
    var stats = {};
    Character.find().then(function(characters){
        characters.forEach(function (char) {

            // add to overall stats
            if (!stats.overall) stats[overall] = { publisher: 'overall' };
            if (!stats.overall[char.gender]) stats.overall[char.gender] = { sum: 0, dataPoints: 0 };
            stats.overall[char.gender].sum += char.issueCount;
            stats.overall[char.gender].dataPoints++

            // add to publisher tally
            if (char.publisher) {
                if (!stats[char.publisher]) stats[char.publisher] = { publisher: char.publisher };
                if (!stats[char.publisher][char.gender]) stats[char.publisher][char.gender] = {sum: 0, dataPoints: 0}
                stats[char.publisher][char.gender].sum += char.issueCount;
                stats[char.publisher][char.gender].dataPoints++;
            }

        });

        var dbPromises = [];
        for (var stat in stats) {
            // calculate averages
            for (var gender in stats[stat]) {
                if (gender !== 'publisher') stats[stat][gender] = stats[stat][gender].sum / stats[stat][gender].dataPoints;
            }
            // promise to save to DB
            dbPromises.push( this.create(stats[stat]) );
        }
        return Promise.all(dbPromises);
    })
    .then(function() {
        console.log(chalk.green("Successfully calculated and seeded new percents"))
    })
    .catch(function(err) {
        console.log(chalk.red("Failed to Save to DB"));
    })
}

schema.statics.getOverall = function() {
    return this.findOne({publisher: 'overall'});
}

schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher})
}

mongoose.model('GenderCount', schema);

module.exports = mongoose.model('GenderCount');