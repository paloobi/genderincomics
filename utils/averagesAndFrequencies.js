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
var offset = 10000;

// set URL to query
var comics = require('../server/env').COMIC_VINE;
var query = '&format=json&field_list=id,count_of_issue_appearances,gender,origin,publisher,name,real_name&sort=name:asc';
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

// making synchronous requests to handle offset and rate limits
var requestSync = require('sync-request');

// var urlToRequest = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query;
// var firstRequest = JSON.parse( requestSync('GET', urlToRequest, { headers: headers }).body.toString() );
var total = 20000;
// var total = firstRequest.number_of_total_results;
console.log(chalk.green("Successfully got first API result - will now query for all " + total + " characters"))

// results list from API calls
var apiCalls = [];
var nextURL;

while (offset < total) {

  // delay required to prevent rate limits
  delay(1000);

  // request the next batch of data, announce which batch it is
   
  nextURL = comics.BASE_URL + '/characters/?api_key=' + comics.API_KEY + query;
  if (offset > 0) nextURL += '&offset=' + offset;
  console.log("Querying at offset: " + offset + " - GET " + nextURL);

  apiCalls.push( JSON.parse( requestSync('GET', nextURL, { headers: headers }).body.toString() ) );
  console.log(chalk.green('succeeded in querying API at offset ' + offset + "\n"))
  offset += 100;

}

console.log( chalk.green('All batches retrieved from API Initiatied\n') );

var dbOpers = [];

var startDb = require('../server/db');

startDb.then(function() {
  console.log('Connection opened with DB');
  // turn API requests into list of characters
  return apiCalls.reduce(function( allResults, result ) {
    return allResults.concat(result.results);
  }, []);
})
.then(function(characters) {

  console.log(chalk.green('Now parsing results data'));

  // create promise to update or create each character in DB
  characters.forEach(function(character) {
    console.log(character);
    if (character) {

      // grab data that exists
      var charData = {}
      if (character.name) charData.name = character.name;
      if (character.real_name) charData.alterEgo = character.real_name
      if (character.id) charData.uid = character.id;
      if (character.gender === 1) charData.gender = 'male';
      else if (character.gender === 2) charData.gender = 'female';
      else charData.gender = 'other'
      if (character.origin) charData.origin = character.origin.name;
      if (character.publisher) charData.publisher = character.publisher.name;
      if (character.count_of_issue_appearances) charData.issueCount = character.count_of_issue_appearances;

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

    }
  })

  return Promise.all(dbOpers);
})
.then(function(characters) {
  console.log(chalk.green("SUCCEEDED: db was seeded with characters from API"));
  process.kill(1);
})
.catch(function(err) {
  console.log(chalk.red("FAILED: " + err.message));
  process.kill(0);
})
