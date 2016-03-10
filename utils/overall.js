var request = require('request');
var mongoose = require('mongoose');
var GenderCount = require('../server/db/models').GenderCount;
var Promise = require('bluebird');
var chalk = require('chalk');

var fs = require('fs');

// promisify async methods
var requestPromise = Promise.promisify(request, {multiArgs: true})

var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&filter=gender:';

var females = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'female',
  headers: {
    'User-Agent': 'paloobi'
  }
})
// .then(function(results) {
//   var res = JSON.parse(results[1]);
//   var numFemale = res.number_of_total_results;
//   console.log('FEMALE: ' + numFemale)
// })
// .catch(console.log)


var males = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'male',
  headers: {
    'User-Agent': 'paloobi'
  }
})


var other = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'other',
  headers: {
    'User-Agent': 'paloobi'
  }
})

function getPercent(num, total) {
  return Math.round(num / total * 100)
}

module.exports = Promise.all([females, males, other])
.then(function(results) {
  console.log(chalk.green('\nRetrieved results from API\n--------------------------'));
  return results.map(function(result) {
    var res = JSON.parse(result[1]);
    return res.number_of_total_results;
  });
})
.then(function(counts){
  counts = counts.map(function(val) {
    return Number(val);
  });
  var total = counts[0] + counts[1] + counts[2];
  var stats = {
    female: getPercent(counts[0], total),
    male: getPercent(counts[1], total),
    other: getPercent(counts[2], total)
  }
  return stats;
})
.then(function(stats) {
  stats.name = 'total';
  return GenderCount.create(stats);
})
.then(function(genderCount){
  console.log(chalk.green('\nWrote GenderCount to DB:\n\nFEMALE: ' + genderCount.female + "\nMALE: " + genderCount.male + "\nOTHER: " + genderCount.other + "\n"));
})
