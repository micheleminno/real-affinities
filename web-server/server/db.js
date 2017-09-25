var config = require('./../config');

var db = require('knex')(config);

module.exports = db;
