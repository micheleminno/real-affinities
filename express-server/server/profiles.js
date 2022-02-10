
const OK = 200;
const NOK = 404;


exports.index = function(req, res) {

  const profile = req.body;

  var deferred = $q.defer();

  var content = "";
  var contentDates = [];
  for ( var tweetIndex in profile.tweets) {

    content += profile.tweets[tweetIndex].text + " ";
    contentDates.push(profile.tweets[tweetIndex].created_at);
  }

  var indexParams = {

    index : 'real-affinities',
    type : 'profile',
    id : profile.id,
    body : {
      screen_name : profile.screen_name,
      name : profile.name,
      location : profile.location,
      url : profile.url,
      profile_image_url : profile.profile_image_url,
      verified : profile.verified,
      description : profile.description,
      statuses_count : profile.statuses_count,
      followers_count : profile.followers_count,
      friends_count : profile.friends_count,
      content : content,
      contentDates : contentDates
    }
  };

  client.index(indexParams, function(error, data) {

    deferred.resolve(data);
  });

  return deferred.promise;
};



exports.load = function(req, res) {

    const userIds = req.query.ids;

    var deferred = $q.defer();

		var query = {
			index : 'real-affinities',
			body : {
				query : {
					ids : {
						type : "profile",
						values : userIds
					}
				}
			}
		};

		client.search(query, function (error, data) {

			var profiles = [];
			for ( var hitIndex in data.hits.hits) {

				var user = data.hits.hits[hitIndex]["_source"];
				user.id = data.hits.hits[hitIndex]["_id"];
				profiles.push(user);
			}

			deferred.resolve(profiles);
		});

		return deferred.promise;
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
