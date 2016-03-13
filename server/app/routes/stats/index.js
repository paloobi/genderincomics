'use strict';
var router = require('express').Router();
var models = require('../../../db/models');

router.get('/', function(req, res, next){
  models.Count.find()
  .then(function(stats){
    res.gendercounts = stats;
    return models.Frequency.find();
  })
  .then(function(stats) {
    // send all statistics to the front-end
    res.json(res.gendercounts.concat(stats));
  })
})

module.exports = router;