var request = require('request');
var mongoose = require('mongoose');
var GenderCount = require('../server/db/models').GenderCount;
var Promise = require('bluebird');
var chalk = require('chalk');

var fs = require('fs');

// promisify async methods
var requestPromise = Promise.promisify(request, {multiArgs: true})

var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&field_list=gender&filter=gender:';
var headers = { 'User-Agent': 'paloobi' }


var females = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'female',
  headers: headers
})

var males = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'male',
  headers: headers
})

var other = requestPromise({
  url: comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query + 'other',
  headers: headers
})
console.log(other);

var stats;

var overallGenderRepresentation = Promise.all([females, males, other])
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
  stats = {
    female: counts[0],
    male: counts[1],
    other: counts[2]
  }
  stats.name = 'total';
  return GenderCount.findOne({name: stats.name});
})
.then(function(statsFromDB) {
  if (!statsFromDB) return GenderCount.create(stats);
  statsFromDB.set(stats);
  return statsFromDB.save();
})
.then(function(genderCount){
  console.log(chalk.green('\nWrote GenderCount to DB:\n\nFEMALE: ' + genderCount.female + "\nMALE: " + genderCount.male + "\nOTHER: " + genderCount.other + "\n"));
})

module.exports = overallGenderRepresentation;
