
const OK = 200;
const NOK = 404;


exports.index = function(req, res) {

		// TODO
};

exports.load = function(req, res) {

		// TODO
};

this.matching = function(interest) {

  interest = interest.replace(" ", "-");

  var deferred = $q.defer();

  var query = {
    index : 'real-affinities',
    body : {
      query : {
        more_like_this : {
          like : [
          {
            _type : 'profile',
            _id : interest
          }],
          fields : ['content'],
          min_term_freq : 1,
          min_doc_freq : 1
        }
      }
    }
  };

  client.search(query, function(error, data) {

    var profiles = [];
    for ( var hitIndex in data.hits.hits) {

      var user = data.hits.hits[hitIndex]["_source"];
      user.id = data.hits.hits[hitIndex]["_id"];
      if (!user.is_interest) {
        profiles.push(user);
      }
    }

    deferred.resolve(profiles);
  });

  return deferred.promise;
};
