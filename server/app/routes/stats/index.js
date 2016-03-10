'use strict';
var router = require('express').Router();
var models = require('../../../db/models');


router.get('/overall', function(req, res, next){
  models.GenderCount.findOne({name: 'total'})
  .then(function(stat){
    res.json(stat);
  })
})

module.exports = router;