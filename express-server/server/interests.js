var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client();

var OK = 200;
var NOK = 404;

function handleClientResponse(error, data, okMsg, nokMsg, res) {

  if (error) {

    console.error(error);
    res.status(NOK).json({nokMsg: error})
  } else {

    console.log(JSON.stringify(data));

    refreshIndexes(res, okMsg);
  }
}

function refreshIndexes(res, msg) {

  client.indices.refresh(function(error, data) {

    if (error) {

      console.error(error);
      res.status(NOK).json({"error refreshing": error})

    } else {

      res.status(OK).json({msg: true});
    }
  });
}

exports.add = function(req, res) {

  var name = req.query.name;
  var nameWithoutInnerSpaces = name.replace(/ /g, "-");

  var query = req.query.query;

  var docToIndex = {

    index: 'real-affinities',
    type: 'profile',
    id: nameWithoutInnerSpaces,
    body: {
      name: name,
      query: query,
      is_interest: true
    }
  };

  client.index(docToIndex, function(error, data) {
    handleClientResponse(error, data, "interest added", "error adding new interest", res);
  });
};

exports.remove = function(req, res) {

  var name = req.query.name;
  var nameWithoutInnerSpaces = name.replace(/ /g, "-");

  var query = {
    index: 'real-affinities',
    body: {
      query: {
        bool: {
          must: {
            ids: {
              type: 'profile',
              values: [nameWithoutInnerSpaces]
            }
          },
          filter: {
            exists: {
              field: 'is_interest'
            }
          }
        }
      }
    }
  };

  client.deleteByQuery(query, function(error, data) {
    handleClientResponse(error, data, "interest " + name + " deleted", "error deleting interest " + name, res);
  });
};

exports.removeAll = function(req, res) {

  var query = {
    index: 'real-affinities',
    body: {
      query: {
        bool: {
          must: {
            match_all: {}
          },
          filter: {
            exists: {
              field: "is_interest"
            }
          }
        }
      }
    }
  };

  client.deleteByQuery(query, function(error, data) {
    handleClientResponse(error, data, "all interests deleted", "error deleting all interests", res);
  });
};

exports.update = function(req, res) {

  var text = req.query.text;

  var name = req.query.name;
  var nameWithoutInnerSpaces = name.replace(/ /g, "-");

  var params = {

    index: 'real-affinities',
    type: 'profile',
    id: nameWithoutInnerSpaces,
    body: {

      doc: {
        content: text
      }
    }
  };

  client.update(params, function(error, data) {
    handleClientResponse(error, data, "interest " + name + " updated", "error updating interest " + name, res);
  });
};

exports.list = function(req, res) {

  var withContent = req.query.withContent;

  var query = {
    index: 'real-affinities',
    body: {
      query: {
        bool: {
          must: {
            match_all: {}
          },
          filter: {
            exists: {
              field: "is_interest"
            }
          }
        }
      }
    }
  };

  client.search(query, function(error, data) {

    var interests = [];

    for (var hitIndex in data.hits.hits) {

      var interest = data.hits.hits[hitIndex]["_source"];
      if (withContent && interest.content || !withContent) {
        interests.push(interest);
      }
    }

    return interests;
  });
};

exports.getMatchingProfiles = function(req, res) {

  var interest = req.query.interestName;

  var nameWithoutInnerSpaces = interest.replace(/ /g, "-");

  var query = {
    index: 'real-affinities',
    body: {
      query: {
        more_like_this: {
          like: [
            {
              _type: 'profile',
              _id: nameWithoutInnerSpaces
            }
          ],
          fields: ['content'],
          min_term_freq: 1,
          min_doc_freq: 1
        }
      }
    }
  };

  client.search(query, function(error, data) {

    var profiles = [];
    for (var hitIndex in data.hits.hits) {

      var user = data.hits.hits[hitIndex]["_source"];
      user.id = data.hits.hits[hitIndex]["_id"];
      if (!user.is_interest) {
        profiles.push(user);
      }
    }

    return profiles;
  });
};
