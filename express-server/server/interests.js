const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: process.env.ELASTICSEARCH_URL })

const OK = 200;
const NOK = 404;

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

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Adding new interest: " + nameWithoutInnerSpaces);

  const query = req.query.query;

  const docToIndex = {

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

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Removing interest: " + nameWithoutInnerSpaces);

  const query = {
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

  console.log("Removing all interests");

  const query = {
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

  const text = req.query.text;

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Updating interest: " + nameWithoutInnerSpaces);

  const params = {

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

  const withContent = req.query.withContent;

  console.log("Getting all interests");

  const query = {
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

    data = data.body;
    let interests = [];

    if(error) {

      console.error(error);

    } else {

        console.log(data);

        if ( typeof data.hits !== 'undefined' && data.hits &&
             typeof data.hits.hits !== 'undefined' && data.hits.hits) {

               const numberOfInterests = data.hits.hits.length;
               console.log(numberOfInterests + " interests retrieved from ES");

               for (let hitIndex in data.hits.hits) {

                 const interest = data.hits.hits[hitIndex]["_source"];
                 if (withContent && interest.content || !withContent) {

                   interests.push(interest);
                 }
               }
        } else {

            console.log("Data hits missing");
        }
    }

    console.log("Found " + interests.length + " interests");
    res.status(OK).json({
      interests : interests
    });
  });
};

exports.getMatchingProfiles = function(req, res) {

  const interest = req.query.interestName;

  const nameWithoutInnerSpaces = interest.replace(/ /g, "-");

  console.log("Getting profiles matching with interest: " + nameWithoutInnerSpaces);

  const query = {
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

    if(error) {
      console.error(error);
    } else {
      console.log("Matching profiles retrieved from ES");
    }

    let profiles = [];

    for (let hitIndex in data.hits.hits) {

      const user = data.hits.hits[hitIndex]["_source"];
      user.id = data.hits.hits[hitIndex]["_id"];
      if (!user.is_interest) {
        profiles.push(user);
      }
    }

    console.log("Found " + profiles.length + " matching profiles");

    res.status(OK).json({
      profiles : profiles
    });
  });
};
