const db = require('./db');

const OK = 200;
const NOK = 404;


/*
exports.add = function(req, res) {

  const label = req.query.label;
  const labelWithoutInnerSpaces = label.replace(/ /g, "-");

  console.log("Adding new trend: " + labelWithoutInnerSpaces);

  const queryParam = req.query.query;

  const query = "INSERT IGNORE INTO trends VALUES (" + userId + ", "
      + data["followers"]["page"] + ", "
      + data["friends"]["page"] + ", "
      + data["followers"]["cursor"] + ", "
      + data["friends"]["cursor"] + ")";

  db.raw(query).then(function(response) {

    if (response[0]["affectedRows"] > 0) {

        console.log("Trend " + trendId + " added");
        resultJson = {"Trend added": true, "Trend id": trendId};
    }
    else {

      console.log("Trend " + trendId + " not added");
      resultJson = {"Trend added": false, "Trend id": trendId};
    }

    res.status(resultStatus).json(resultJson);
  })
  .catch(function(error) {

    console.error(error);
    res.status(NOK).json({"error": error})
  });
};

exports.remove = function(req, res) {

  const name = req.query.name;
  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Removing trend: " + nameWithoutInnerSpaces);

  // TODO
};

exports.removeAll = function(req, res) {

  console.log("Removing all trends");

  // TODO
};

exports.update = function(req, res) {

  const text = req.query.text;
  const name = req.query.name;

  console.log("Updating trend with name " + name + " with text " + text);

  const nameWithoutInnerSpaces = name.replace(/ /g, "-");

  console.log("Name trend without inner spaces: " + nameWithoutInnerSpaces);

  // TODO
};

exports.list = function(req, res) {

  console.log("Getting all trends");

  db.select('id')
		.from('trends')
		.then(function(rows) {

			let ids = [];
			for ( let rowIndex in rows) {

				ids.push(rows[rowIndex]["id"]);
			}

			res.status(OK).json({
				trendIds : ids
			});
		})
	  .catch(function(error) { console.error(error); });
};
*/
