const utilities = require('./utilities');

const { Client } = require('@elastic/elasticsearch');
const ES = process.env.ELASTICSEARCH_URL? process.env.ELASTICSEARCH_URL : 'http://localhost:9200';
const client = new Client({ node: ES });

const OK = 200;
const NOK = 404;

exports.test = function(req, res) {

  const data = req.body;
  console.log("Test API");
  console.log(data);

  res.status(OK).json({ data : data });
};

exports.index = function(req, res) {

  const profile = req.body;

  console.log("Indexing profile");

  var content = "";
  var contentDates = [];
  for ( var tweetIndex in profile.tweets) {

    content += profile.tweets[tweetIndex].text + " ";
    contentDates.push(profile.tweets[tweetIndex].created_at);
  }

  const docToIndex = {

    index : 'real-affinities',
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
    utilities.handleClientResponse(error, data, "profile indexed", "error indexing new profile", res, client);
  });
};

exports.load = function(req, res) {

    var userIds = req.query.ids;

    //make an array of numbers from id list
    userIds = Array.from(userIds.split(','), Number);

    console.log("Loading profiles with ids: " + userIds);

		var query = {
			index : 'real-affinities',
			body : {
				query : {
					ids : {
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

exports.matching = function(req, res) {

  const interestName = req.query.name.replace(" ", "-");
  const interestQuery = req.query.query;

  console.log("Searching for profiles matching with interest: " + interestName);

  var query = {
    index : 'real-affinities',
    body : {
      query : {
        more_like_this : {
          like : [
          {
            _id : interestName
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
