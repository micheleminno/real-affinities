const config = require('./../config');

const db = require('knex')(config);

module.exports = db;
