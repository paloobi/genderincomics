'use strict';
var router = require('express').Router();
var models = require('../../../db/models');

router.get('/percent', function(req, res, next){
  models.Percent.find()
  .then(function(stats){
    res.json(stats);
  })
})

router.get('/issues', function(req, res, next) {
  models.Issues.find()
  .then(function(stats){
    res.json(stats);
  })
})

router.get('/origins', function(req, res, next) {
  models.Origins.find()
  .then(function(stats) {
    res.json(stats);
  })
})

router.get('/names', function(req, res, next) {
  models.Names.find()
  .then(function(stats){ 
    res.json(stats);
  })
})

module.exports = router;