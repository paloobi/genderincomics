var Promise = require('bluebird');
var chalk = require('chalk');
var fs = require('fs');
var request = require('request');
// promisify async requests
var requestPromise = Promise.promisify(request, {multiArgs: true})
// import models
var mongoose = require('mongoose');
var Character = require('../server/db/models').Character;

// offset from which to start the API calls
var offset = 0;

// set URL to query
var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&field_list=count_of_issue_appearances,gender,origin,publisher,name,real_name';
var headers = { 'User-Agent': 'apolubi' }

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

// first request is synchronous - grabs total number of requests to be made
var requestSync = require('sync-request');
var urlToRequest = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query;
var firstRequest = JSON.parse( requestSync('GET', urlToRequest, { headers: headers }).body.toString() );
var total = firstRequest.number_of_total_results;
console.log(chalk.green("Successfully got first API result - will now query for all " + total + " characters"))

// list of promises to save data to DB;
var apiCalls = [];

while (offset < total) {

  // delay required to prevent rate limits
  delay(1000);

  // request the next batch of data, announce which batch it is
  console.log("Querying at offset: " + offset);
   
  var urlToRequest = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query;

  if (offset > 0) urlToRequest += '&offset=' + offset;

  var promiseForData = requestPromise({
    url: urlToRequest,
    headers: headers
  });

  apiCalls.push(promiseForData);
  // console.log(apiCalls);

  offset += 100;

}

console.log( chalk.green('All Requests to API Initiatied\n') );

var dbOpers = [];

var startDb = require('../server/db');

startDb.then(function() {
  return Promise.all(apiCalls); 
})
.then(function(results) {
  console.log(chalk.green('All batches retrieved from API'));
  batches = results.map(function(result) {
    return JSON.parse(result[1]).results;
  })
  return batches.reduce(function( allResults, resultArray ) {
    return allResults.concat(resultArray);
  }, []);
})
.then(function(characters) {

  console.log(chalk.green('Now parsing results data'));

  // create promise to update or create each character in DB
  characters.forEach(function(character) {
    var charData = {
      name: character.name,
      alterEgo: character.real_name,
      uid: character.id,
      gender: character.gender,
      origin: character.origin,
      publisher: character.publisher,
      issueCount: character.count_of_issue_appearances
    }
    var charPromise = Character.findOne({ uid: character.id })
      .then(function(charFromDB){
        if (!charFromDB) {
          return Character.create(charData)
        } else {
          charFromDB.set(charData);
          return charFromDB.save();
        }
    });
    // push promise to list of promises
    dbOpers.push(charPromise);
  })

  return Promise.all(dbOpers);
})
.then(function(characters) {
  console.log(chalk.green("SUCCEEDED: db was seeded with characters from API"));
  process.kill(1)
})
.catch(function(err) {
  console.log(chalk.red("FAILED: " + err.message));
  process.kill(0);
})

