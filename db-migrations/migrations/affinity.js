
exports.up = function(knex) {

  return knex.schema.createTable('affinity', function (table) {
    table.string('id').primary();
    table.integer('follows');
    table.integer('followed_by');
  });
};

exports.down = function(knex) {

  return knex.schema.dropTable('affinity');
};
