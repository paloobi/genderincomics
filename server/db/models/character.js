'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    name: String,
    alterEgo: String, 
    uid: String,
    gender: {
      type: String,
      enum: ['female', 'male', 'other'],
    },
    origin: String,
    publisher: String,
    issueCount: Number
});


var Character = mongoose.model('Character', schema);

module.exports = Character;