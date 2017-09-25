
exports.seed = function(knex, Promise) {
  return Promise.join(

    knex('target').del(),

    knex('target').insert([
      {
        "id": 1,
        "last_followers_page": 15,
        "last_friends_page": 4,
        "followers_next_cursor": 123,
        "friends_next_cursor": 456
      },
      {
        "id": 4,
        "last_followers_page": 12,
        "last_friends_page": 15,
        "followers_next_cursor": 333,
        "friends_next_cursor": 444
      }
    ])
  );
};
