const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ELASTICSEARCH_URL });

const OK = 200;
const NOK = 404;

exports.index = function(req, res) {

  const profileParam = req.body;
  console.log("Indexing profile: " + profileParam);

  const profile = JSON.parse(profileParam);

  var content = "";
  var contentDates = [];
  for ( var tweetIndex in profile.tweets) {

    content += profile.tweets[tweetIndex].text + " ";
    contentDates.push(profile.tweets[tweetIndex].created_at);
  }

  const docToIndex = {

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

  client.index(docToIndex, function(error, data) {
    handleClientResponse(error, data, "profile indexed", "error indexing new profile", res);
  });
};

exports.load = function(req, res) {

    const userIds = req.query.ids;

    console.log("Loading profiles with ids: " + userIds);

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

      data = data.body;
      var profiles = [];

      if(error) {
        console.error(error);
      } else {
        console.log(data);

        if ( typeof data.hits !== 'undefined' && data.hits &&
             typeof data.hits.hits !== 'undefined' && data.hits.hits) {

           const numberOfProfiles = data.hits.hits.length;
           console.log(numberOfProfiles + " profiles retrieved from ES");

           for (let hitIndex in data.hits.hits) {

             const profile = data.hits.hits[hitIndex]["_source"];

             profiles.push(profile);
           }
        } else {

            console.log("Data hits missing");
        }
      }

      console.log(profiles.length + " profiles loaded");
      res.status(OK).json({
        profiles : profiles
      });
		});
};

this.matching = function(interest) {

  interest = interest.replace(" ", "-");
  console.log("Searching for profiles matching with interest: " + interest);

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

    data = data.body;
    var profiles = [];

    if(error) {
      console.error(error);
    } else {
      console.log(data);

      if ( typeof data.hits !== 'undefined' && data.hits &&
           typeof data.hits.hits !== 'undefined' && data.hits.hits) {

         const numberOfProfiles = data.hits.hits.length;
         console.log(numberOfProfiles + " profiles retrieved from ES");

         for (let hitIndex in data.hits.hits) {

           const profile = data.hits.hits[hitIndex]["_source"];

           profiles.push(profile);
         }
      } else {

          console.log("Data hits missing");
      }
    }

    console.log(profiles.length + " profiles loaded");
    res.status(OK).json({
      profiles : profiles
    });
  });
};
