'use strict';

var mongoose = require('mongoose');

var frequencyStat = new mongoose.Schema({
    label: String,
    frequency: Number
})

var schema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    female: [frequencyStat],
    male: [frequencyStat],
    other: [frequencyStat]
});


mongoose.model('FrequencyCount', schema);

module.exports = mongoose.model('FrequencyCount');