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
    }
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
            // add to overall tally
            if (!stats.overall) stats[overall] = {publisher: 'overall', female: 0, male: 0, other: 0}; 
            stats.overall[char.gender]++;

            // add to publisher tally
            if (char.publisher) {
                if (!stats[char.publisher]) stats[char.publisher] = {publisher: char.publisher};
                if (!stats[char.publisher][char.gender]) stats[char.publisher][char.gender] = 0;
                stats[char.pub][char.gender]++;
            }
        });

        var dbPromises = [];
        for (var stat in stats) {
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

schema.statics.findOverall = function() {
    return this.findOne({publisher: 'overall'})
}
  
schema.statics.getByPublisher = function(publisher) {
    return this.findOne({publisher: publisher});
}

mongoose.model('Percent', schema);

module.exports = mongoose.model('Percent');