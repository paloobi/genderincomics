var request = require('request');
var mongoose = require('mongoose');
var GenderCount = require('../server/db/models').GenderCount;
var FrequencyCount = require('../server/db/models').FrequencyCount;
var Promise = require('bluebird');
var chalk = require('chalk');
var requestSync = require('sync-request');

var fs = require('fs');

// promisify async methods
var requestPromise = Promise.promisify(request, {multiArgs: true})

var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&field_list=count_of_issue_appearances,api_detail_url&filter=gender:';
var headers = { 'User-Agent': 'apolubi' }


var femalesStart = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'female',
  headers: headers
})

var malesStart = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'male',
  headers: headers
})

var otherStart = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'other',
  headers: headers
})

function callAPIs ( url, APIs ) {
  var API = APIs.shift();
  request({ url: url, headers: headers }, function(res, body) { 

  });
}

// average # issue appearances by gender
var averageAppearances = {"name": "numIssues"}

// average deaths per character by gender
var averageDeaths = {"name": "numDeaths"}

// frequency of each type of origin by gender
var originFrequency = {"name": "origins", "female": {}, "male": {}, "other": {}}

// frequency of each power by gender
var powersFrequency = {"name": "powers", "female": {}, "male": {}, "other": {}}

function getData(gender, total) {
  var offset = 0;
  var numCharacters = 0;
  var totalIssues = 0;
  var totalDeaths = 0;
  while (offset < total) {
    offset += 100;
    var appearances = JSON.parse(requestSync('GET',
      comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + gender + '&offset=' + offset,
      { headers: headers }).body.toString());
    console.log(appearances)
    totalIssues += appearances.results.reduce(function(sum, character) {

      // add their origin to the list
      if (!originFrequency[gender][character.origin]) originFrequency[gender][character.origin] = 0;
      originFrequency[gender][character.origin]++;
      
      // grab character info for death and powers stats
      var characterURL = character.api_detail_url + '?api_key=' + comics.API_KEY + '&format=json&field_list=issues_died_in,powers&filter=gender:' + gender;
      console.log(characterURL);
      var characterFromAPI = JSON.parse(requestSync('GET', characterURL).body).toString();
    
      // add deaths to the deathCount
      totalDeaths += characterFromAPI.issues_died_in;
      
      // count frequency of powers for this gender
      if (typeof characterFromAPI.powers === 'string') characterFromAPI.powers = characterFromAPI.powers.split("\n").map(function(val) { return val.trim(); })
      characterFromAPI.powers.forEach(function(power){
        if (!powersFrequency[gender][characterFromAPI.power]) powersFrequency[gender][characterFromAPI.power] = 0;
        powersFrequency[gender][characterFromAPI.power]++;
      })

      // add their issue count to the total
      return sum + character.count_of_issue_appearances;
    }, totalIssues) 
  }
  averageAppearances[gender] = totalIssues / total;
  averageDeaths[gender] = totalDeaths / total;
}

var numIssues = Promise.all([femalesStart, malesStart, otherStart])
.then(function(results) {
  console.log(chalk.green('\nRetrieved initial results from API\n--------------------------'));
  return results.map(function(result) {
    var res = JSON.parse(result[1]);
    return res;
  });
})
.then(function(counts){

  getData('female', counts[0].number_of_total_results);
  getData('male', counts[1].number_of_total_results);
  getData('other', counts[2].number_of_total_results);

  // check if Appearance stat already in DB
  return GenderCount.findOne({name: "numIssues"});
})
.then(function(numIssues) {
  if (!numIssues) return GenderCount.create(averageAppearances);
  else {
    numIssues.set(averageAppearances);
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
    numDeaths.set(averageDeaths);
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
    origins.set(originFrequency);
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
    powers.set(powersFrequency);
    return powers.save();
  }
})
.then(function(powers) {
  if (powers) console.log(chalk.green('Saved Powers to DB'));
  else console.log(chalk.red('Failed to save Powers to DB'));

  process.kill(1);
})
.catch(console.log)


module.exports = numIssues;
