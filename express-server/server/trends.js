const db = require('./db');

const OK = 200;
const NOK = 404;


exports.add = function(req, res) {

  const name = req.query.name;
  const nameWithoutInnerSpaces = label.replace(/ /g, "-");

  //const query = req.query.query;
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  console.log("Adding new trend: " + nameWithoutInnerSpaces + " from date " + fromDate +
              " to date " + toDate);

  // Calling trend service and getting data points

  const query = "INSERT IGNORE INTO trends VALUES (" + nameWithoutInnerSpaces + ", "
                 + timestamp + ", " + value + ")";

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
