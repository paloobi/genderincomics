'use strict';
var router = require('express').Router();
var models = require('../../../db/models');


router.get('/:name', function(req, res, next){
  models.GenderCount.findOne({name: req.params.name})
  .then(function(stat){
    res.json(stat);
  })
})

module.exports = router;