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

// add ability to clean empty values from an array
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] === deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

function calculatePercent () {
    
    return Character.find().then(function(characters){
        var stats = {};
        characters.forEach(function (char) {
            // add to overall tally
            if (!stats.overall) stats.overall = {
                publisher: 'overall', female: 0, male: 0, other: 0
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
        for (var publisher in stats) {
            // promise to save to DB
            ( function(obj) { 
                dbPromises.push( models.Percent.findOne({ publisher: obj.publisher })
                    .then(function(statFromDB) {
                        if (!statFromDB) {
                            return models.Percent.create(obj);
                        } else {
                            statFromDB.set(obj);
                            return statFromDB.save();
                        }
                    })
                )
            })(stats[publisher]);
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
            if (!stats.overall) stats.overall = {
                publisher: 'overall',
                female: { sum: 0, dataPoints: 0 },
                male: { sum: 0, dataPoints: 0 },
                other: { sum: 0, dataPoints: 0 }
            };
            if (typeof char.issueCount === 'number') {
                stats.overall[char.gender].sum += char.issueCount;
                stats.overall[char.gender].dataPoints++;
            }

            // add to publisher tally
            if (char.publisher) {
                if (!stats[char.publisher]) stats[char.publisher] = {
                    publisher: char.publisher,
                    female: { sum: 0, dataPoints: 0 },
                    male: { sum: 0, dataPoints: 0 },
                    other: { sum: 0, dataPoints: 0 }
                };
                if (typeof char.issueCount === 'number') {
                    stats[char.publisher][char.gender].sum += char.issueCount;
                    stats[char.publisher][char.gender].dataPoints++;
                }
            }

        });

        var dbPromises = [];

        for (var publisher in stats) {
            // calculate averages
            ( function(obj) {
                var statsToSave = { publisher: obj.publisher }
                statsToSave.female = obj.female.dataPoints && obj.female.sum ? obj.female.sum / obj.female.dataPoints : 0;
                statsToSave.male = obj.male.dataPoints && obj.male.sum ? obj.male.sum / obj.male.dataPoints : 0;
                statsToSave.other = obj.other.dataPoints && obj.other.sum ? obj.other.sum / obj.other.dataPoints : 0;
                
                // promise to save to DB
                dbPromises.push( models.Issues
                    .findOne({publisher: obj.publisher})
                    .then(function(statFromDB) {
                        if (!statFromDB) models.Issues.create(statsToSave);
                        else {
                            statFromDB.set(statsToSave);
                            return statFromDB.save();
                        }
                    })
                )
            })(stats[publisher]);
        }
        return Promise.all(dbPromises);
    })
    .catch(function(err) {
        console.log(chalk.red("Error saving Issues to DB: " + err.stack));
    })
}

function calculateFrequency (type) {
    var modelToUse;
    if (type === "origins") modelToUse = models.Origins;
    if (type === "names") modelToUse = models.Names; 

    return Character.find()
    .then(function(characters) {

        var stats = {};
        characters.forEach(function(char) {
            var value = char[type.slice(0, type.length - 1)];
            if (type === "names") value = value.split(" ")[0].toLowerCase();

            if (value && typeof value === 'string') {
                // add to overall
                if (!stats.overall) stats.overall = {
                    publisher: "overall", female: [], male: [], other: []
                };
                if (!stats.overall[char.gender][value]) stats.overall[char.gender][value] = 0;
                stats.overall[char.gender][value]++;

                // add to publisher count
                if (char.publisher) {
                    if (!stats[char.publisher]) stats[char.publisher] = {
                        publisher: char.publisher, female: [], male: [], other: []
                    };
                    if (!stats[char.publisher][char.gender][value]) stats[char.publisher][char.gender][value] = 0;
                    stats[char.publisher][char.gender][value]++;
                }
            }

      });

      var arr;

      function getTop10 (unsorted, gender) {
        arr = [];
        for (key in unsorted[gender]) {
            if (unsorted[gender].hasOwnProperty(key)) {
                arr.push({ name: key, count: unsorted[gender][key] });
            }
        }
        if (type === "names") console.log(arr);
        arr.sort(function(a, b) { return b.count - a.count; });
        return arr.length > 10 ? arr.slice(0,11) : arr.slice();
      }

      var promises = [];

      // create promises to save stats to DB
      for (var publisher in stats) {

        // ignore if not enough data
        if (type === 'names') console.log(stats[publisher]);
        if (!Object.keys(stats[publisher].female).length || !Object.keys(stats[publisher].male).length) {
            continue;
        }
        
        (function(obj) {
            // console.log(obj)
            var pubStats = { publisher: obj.publisher };

            // find top 10 for each gender
            ['female', 'male', 'other'].forEach(function(gender) {
                pubStats[gender] = getTop10(obj, gender);
            });
            if (type === 'origins') console.log(pubStats);
            //push promise to save this set of stats to DB
            promises.push( modelToUse
                .findOne({publisher: pubStats.publisher })
                .then(function(statsFromDB) {
                    if (!statsFromDB) return modelToUse.create ( pubStats );
                    else {
                        statsFromDB.set( pubStats );
                        return statsFromDB.save();
                    }
                })
            )

        })(stats[publisher]);

      }

      return Promise.all( promises );
    })
    .catch(function(err){
        console.log(chalk.red("Error while saving " + type + " to DB: " + err.stack));
    })
}

connectToDb
.then(function () {
    return calculatePercent();
})
.then(function(percentStats) {
    console.log(chalk.green("Saved " + percentStats.length + " Percent Stats to DB"));
    return calculateIssues();
})
.then(function(issueStats) {
    console.log(chalk.green("Saved " + issueStats.length + " Issues Stats to DB"));
    return calculateFrequency('origins');
})
.then(function(originStats) {
    console.log(chalk.green('Saved ' + originStats.length + ' Origin frequencies Stats to DB'));
    return calculateFrequency('names');
})
.then(function(nameStats) {
    console.log(chalk.green("Saved " + nameStats.length + " Name frequencies Stats to DB"));
    console.log(chalk.green("DONE SEEDING THE DB"));
    process.kill(0);
})
.catch(function(err) {
    console.log(chalk.red(err.message + "FAILED TO SEED DB"));
    process.kill(1);
})