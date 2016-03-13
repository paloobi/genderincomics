/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');
var chalk = require('chalk');
var connectToDb = require('./server/db');

var models = require('./server/db/models');
var Character = models.Character;

function calculatePercent () {
    
    return Character.find().then(function(characters){
        var stats = {};
        characters.forEach(function (char) {
            // add to overall tally
            if (!stats.overall) stats.overall = {
                publisher: 'overall',female: 0, male: 0, other: 0
            }; 
            stats.overall[char.gender]++;

            // add to publisher tally
            if (char.publisher) {
                if (!stats[char.publisher]) stats[char.publisher] = {
                    publisher: char.publisher, female: 0, male: 0, other: 0
                };
                stats[char.publisher][char.gender]++;
            }
        });

        var dbPromises = [];
        for (var stat in stats) {
            // promise to save to DB
            ( function(obj) { 
                console.log(obj.publisher);
                dbPromises.push( models.Percent.findOne({ publisher: obj.publisher })
                    .then(function(statFromDB) {
                        if (!statFromDB) {
                            console.log('creating new for ' + obj.publisher);
                            return models.Percent.create(obj);
                        } else {
                            console.log('changing old for ' + obj.publisher);
                            statFromDB.set(obj);
                            return statFromDB.save();
                        }
                    })
                )
            })(stats[stat]);
        }
        return Promise.all(dbPromises);
    })
    .catch(function(err) {
        console.log(chalk.red("Error while saving Percent to DB: " + err.stack));
    })
}

function calculateIssues() {
    return Character.find().then(function(characters){
        var stats = {};
        characters.forEach(function (char) {

            // add to overall stats
            if (!stats.overall) stats[overall] = {
                publisher: 'overall',
                female: { sum: 0, dataPoints: 0 },
                male: { sum: 0, dataPoints: 0 },
                other: { sum: 0, dataPoints: 0 }
            };
            stats.overall[char.gender].sum += char.issueCount;
            stats.overall[char.gender].dataPoints++

            // add to publisher tally
            if (char.publisher) {
                if (!stats[char.publisher]) stats[char.publisher] = {
                    publisher: char.publisher,
                    female: { sum: 0, dataPoints: 0 },
                    male: { sum: 0, dataPoints: 0 },
                    other: { sum: 0, dataPoints: 0 }
                };
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
            dbPromises.push( models.Issues.findOne({publisher: stats[stat].publisher})
                .then(function(statFromDB) {
                    if (!statFromDB) models.Issues.create(stats[stat]);
                    else {
                        statFromDB.set(stats[stat]);
                        return statFromDB.save();
                    }
                })
            )
        }
        return Promise.all(dbPromises);
    })
    .catch(function(err) {
        console.log(chalk.red("Error saving Issues to DB: " + err.stack));
    })
}

function calculateFrequency (type) {
    var modelToUse = type === "origins" ? models.Origins : models.Names; 

    return Character.find()
    .then(function(characters) {
        var stats = {};
        characters.forEach(function(character) {

        // add to overall
        if (!stats.overall) stats.overall = {
            publisher: "overall", female: [], male: [], other: []
        };
        if (!stats.overall[char.gender][character[type]]) stats.overall[char.gender][character[type]] = 0;
        stats.overall[char.gender][character[type]]++;

        // add to publisher count
        if (char.publisher) {
            if (!stats[char.publisher]) stats[char.publisher] = {
                publisher: char.publisher, female: [], male: [], other: []
            };
            if (!stats[char.publisher][char.gender][character[type]]) stats[char.publisher][char.gender][char[type]] = 0;
            stats[char.publisher][char.gender][char[type]]++;
        }

      });

      var arr;
      var promises = [];
      for (var pub in stats) {

        var pubStats = { publisher: stats[pub].publisher };
        // find top 10 for each gender
        ['female', 'male', 'other'].forEach(function(gender) {
            arr = [];
            for (key in stats[pub][gender]) {
                arr.push({ name: key, count: stats[pub][gender][key] });
            }
            arr.sort(function(a, b) { return b.count - a.count; });
            pubStats[gender] = arr.slice(0,11);
        })

        //push promise to save this set of stats to DB
        promises.push( modelToUse.findOne({publisher: pubStats.publisher })
            .then(function(stats) {
                if (!stats) return modelToUse.create ( pubStats );
                else {
                    stats.set( pubStats );
                    return stats.save();
                }
            })
        )

      }

      return Promise.all( promises );
    })
    .catch(function(err){
        console.log(chalk.red("Error while saving Origins to DB: " + err.stack));
    })
}

connectToDb
.then(function () {
    return calculatePercent();
})
.then(function() {
    console.log(chalk.green("Saved Percent to DB"));
    return calculateIssues();
})
.then(function() {
    console.log(chalk.green("Saved Issues to DB"));
    return calculateFrequency('origins');
})
.then(function() {
    console.log(chalk.green('Saved Origin frequencies to DB'));
    return calculateFrequency('names');
})
.then(function() {
    console.log(chalk.green("Saved Name frequencies to DB"));
    console.log(chalk.green("DONE SEEDING THE DB"));
    process.kill(1);
})
.catch(function(err) {
    console.log(chalk.red(err.message + "FAILED TO SEED DB"));
    process.kill(0);
})