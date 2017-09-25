
exports.up = function(knex) {

  return knex.schema.createTable('target', function (table) {
    table.string('id').primary();
    table.integer('last_followers_page');
    table.integer('last_friends_page');
    table.string('followers_next_cursor');
    table.string('friends_next_cursor');
  });
};

exports.down = function(knex) {

  return knex.schema.dropTable('target');
};
