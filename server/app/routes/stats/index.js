'use strict';
var router = require('express').Router();
var models = require('../../../db/models');

router.get('/', function(req, res, next){
  models.Character.find()
  .then(function(stats){
    res.json(stats);
  })
})

module.exports = router;