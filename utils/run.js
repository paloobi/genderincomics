'use strict';
var chalk = require('chalk');

// Requires in ./db/index.js -- which returns a promise that represents
// mongoose establishing a connection to a MongoDB database.
var startDb = require('../server/db');

startDb
.then(function() {
  return require('./overall.js')
})
.then(function(){
  console.log(chalk.green('Succeeded!!'));
  process.kill(0);
})
.catch(function (err) {
    console.error(chalk.red(err.stack));
    process.kill(1);
});
