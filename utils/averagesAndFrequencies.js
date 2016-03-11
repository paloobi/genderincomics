var request = require('request');
var mongoose = require('mongoose');
var GenderCount = require('../server/db/models').GenderCount;
var FrequencyCount = require('../server/db/models').FrequencyCount;
var Promise = require('bluebird');
var chalk = require('chalk');
var requestSync = require('sync-request');

// CHANGE OFFSET TO GET LATER DATA AND ADD TO DB
var startFromOffset = 0;

var fs = require('fs');

// promisify async methods
var requestPromise = Promise.promisify(request, {multiArgs: true})

var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&field_list=count_of_issue_appearances,api_detail_url&filter=gender:';
var headers = { 'User-Agent': 'apolubi' }

var malesStart = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'male',
  headers: headers
})

var otherStart = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'other',
  headers: headers
})


// average # issue appearances by gender
var averageAppearances = {"name": "numIssues"}

// average deaths per character by gender
var averageDeaths = {"name": "numDeaths"}

// frequency of each type of origin by gender
var originFrequency = {"name": "origins", "female": {}, "male": {}, "other": {}}

// frequency of each power by gender
var powersFrequency = {"name": "powers", "female": {}, "male": {}, "other": {}}


function delay(ms) {
    var curr_time = new Date();
    var curr_ticks = curr_time.getTime();
    var ms_passed = 0;
    while(ms_passed < ms) {
        var now = new Date();  // Possible memory leak?
        var ticks = now.getTime();
        ms_passed = ticks - curr_ticks;
        now = null;  // Prevent memory leak?
    }
}

function calculateNewAverage(newObj, dbObj) {
  var newAverages = {};
  // calculate new average using weighted average
  var newTotal = newObj.dataPoints + dbObj.dataPoints;
  for (var i in newObj) {
    if (i === 'name') newAverages.name = newObj[name];
    else if (i !== 'dataPoints') {
      newAverages[i] = ( (newObj[i] * newObj.dataPoints) + (dbObj[i] * dbObj.dataPoints) ) / newTotal;
    }
  }
  return newAverages;
}

function mergeDataSets(oldObj, newObj) {
  var newData = {};
  for (var i in oldObj) {
    if (i === 'name') {
      newData.name = oldObj[name];
    } else {
      for (var x in oldObj[i]) {
        newData[i][x] = oldObj[i][x] + newObj[i][x];
      }
    }
  }
  return newData;
}

function getData(gender) {
  var offset = startFromOffset;
  var numCharacters = 0;
  var totalIssues = 0;
  var totalDeaths = 0;
  
  var urlToRequest = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + gender;

  var firstRequest = JSON.parse( requestSync('GET', urlToRequest, { headers: headers }).body.toString() );
  var total = firstRequest.number_of_total_results;

  while (offset < total) {

    // request the next batch of data, announce which batch it is
    console.log("Querying " + gender + " at offset: " + offset);
   
    var urlToRequest = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + gender;
    if (offset > 0) urlToRequest += '&offset=' + offset;

    var appearances = JSON.parse( requestSync('GET', urlToRequest, { headers: headers }).body.toString() );
    
    appearances.results.forEach(function(sum, character) {
      
      if (character.api_detail_url) {

        // delay required for rate limiting
        delay(1000);

        // grab character info for death and powers stats
        var characterURL = character.api_detail_url + '?api_key=' + comics.API_KEY + '&format=json&field_list=issues_died_in,powers&filter=gender:' + gender;

        try {

          var characterFromAPI = JSON.parse( requestSync('GET', characterURL, { headers: headers }).body.toString() );
          console.log(chalk.green('grabbed character data... parsing...'))
          
          // increase number of characters so far
          numCharacters++;

          // add their issue count to the total
          totalIssues += character.count_of_issue_appearances

          // add their origin to the list
          if (!originFrequency[gender][character.origin]) originFrequency[gender][character.origin] = 0;
          originFrequency[gender][character.origin]++;

          // add deaths to the deathCount
          totalDeaths += characterFromAPI.results.issues_died_in.length;

          // update averages and total dataPoints for each averages stat
          averageAppearances[gender] = totalIssues / numCharacters;
          averageAppearances[gender].dataPoints = numCharacters;
          averageDeaths[gender] = totalDeaths / numCharacters;
          averageDeaths[gender].dataPoints = numCharacters;
          
          // count frequency of powers for this gender
          var powerList = characterFromAPI.results.powers;
          powerList.forEach(function(power){
            if (!powersFrequency[gender][power.name]) powersFrequency[gender][power.name] = 0;
            powersFrequency[gender][power.name]++;
          })

          // Once data retrieved
          // check if Appearance stat already in DB
          GenderCount.findOne({name: "numIssues"});
          .then(function(numIssues) {
            if (!numIssues) return GenderCount.create(averageAppearances);
            else {
              numIssues.set(calculateNewAverage( averageAppearances, numIssues ) );
              return numIssues.save();
            }
          })
          .then(function(numIssues) {
            if (numIssues) console.log(chalk.green('Saved Average Issue Appearances to DB'));
            else console.log(chalk.red('Failed to save Average Issue Appearances to DB'));

            // check if Deaths stat already in DB
            return GenderCount.findOne({name: "numDeaths"});
          })
          .then(function(numDeaths) {
            if (!numDeaths) return GenderCount.create(averageDeaths);
            else {
              numDeaths.set(calculateNewAverage( averageDeaths, numDeaths ) );
              return numDeaths.save()
            }
          })
          .then(function(deaths) {
            if (deaths) console.log(chalk.green('Saved Deaths to DB'));
            else console.log(chalk.red('Failed to save Deaths to DB'));

            // check if origins already in DB
            return FrequencyCount.findOne({name: "origins"});
          })
          .then(function(origins) {
            if (!origins) return FrequencyCount.create(originFrequency);
            else {
              origins.set( mergeDataSets(originFrequency, origins) );
              return origins.save();
            }
          })
          .then(function(origins) {
            if (origins) console.log(chalk.green('Saved Origins to DB'));
            else console.log(chalk.red("Failed to save Origins to DB"));

            // check if powers already in DB
            return FrequencyCount.findOne({name: "powers"});
          })
          .then(function(powers) {
            if (!powers) return FrequencyCount.create(powersFrequency);
            else {
              powers.set( mergeDataSets(powersFrequency, powers) );
              return powers.save();
            }
          })
          .then(function(powers) {
            if (powers) console.log(chalk.green('Saved Powers to DB'));
            else console.log(chalk.red('Failed to save Powers to DB'));

            process.kill(1);
          })
          .catch(function(err) {
            console.log(err.stack)
          })

        } catch(e) {
            console.log(chalk.red(e.message + ": errored on a character request"));
        }

      }

    });

    offset += 100;
  }

  console.log(chalk.green('FINISHED'));
}

getData('female');
getData('male');
getData('other');

module.exports = numIssues;
