const affinities = require('./affinities');
const db = require('./db');

const OK = 200;
const NOK = 404;

exports.list = function(req, res) {

  console.log("Getting all profile ids in target");

  db.select('id')
		.from('target')
		.then(function(rows) {

			let ids = [];
			for ( let rowIndex in rows) {

				ids.push(rows[rowIndex]["id"]);
			}

			res.status(OK).json({
				targetIds : ids
			});
		})
	  .catch(function(error) { console.error(error); });
};

exports.add = function(req, res) {

		const userId = req.query.id;

    affinities.add(userId, function(data) {

            let resultStatus = OK;
            let resultJson = "";

            if(data.userId === null) {

                resultStatus = NOK;
                resultJson = {error: "User " + userId + " doesn't exist"};
            }
            else {

            	console.log("Affinities added for user " + userId);

            	const query = "INSERT IGNORE INTO target VALUES (" + userId + ", "
        					+ data["followers"]["page"] + ", "
        					+ data["friends"]["page"] + ", "
        					+ data["followers"]["cursor"] + ", "
        					+ data["friends"]["cursor"] + ")";

              db.raw(query).then(function(response) {

                console.log("Response from db when inserting a profile in target:");
                console.log(response);

                if (response[0].affectedRows > 0) {

                    resultJson = {"User added": true, "User id": userId};
                }
                else {

                  resultJson = {"User added": false, "User id": userId};
                }
              })
              .catch(function(error) {

                console.error(error);
                res.status(NOK).json({"error": error})
              });
    		    }

            res.status(resultStatus).json(resultJson);
		});
};

exports.remove = function(req, res) {

		const userId = req.query.id;
    let resultStatus = OK;
    let resultJson = "";

		affinities.remove(userId, function(data) {

			console.log("Affinities removed for user " + userId);
			console.log(JSON.stringify(data));

			db('target')
        .where('id', userId)
        .del()
        .then(function(response) {

          console.log("Response from db when deleting a profile from target:");
          console.log(response);

          if (response === 1) {

            resultJson = {"User deleted": true, "User id": userId};
          }
          else {

            resultJson = {"User deleted": false, "User id": userId};
          }
        })
        .catch(function(error) {

          console.error(error);
          res.status(NOK).json({"error": error})
        });

      res.status(resultStatus).json(resultJson);
	 });
};

exports.removeAll = function(req, res) {

		db('target')
      .truncate()
      .then(function() {

        db('affinity')
          .truncate()
          .then(function() {

          			res.end("1");
					});
	 });
};

exports.contains = function(req, res) {

		db('target')
      .count('* as t')
      .where('id', req.query.id)
      .then(function(rows) {

				res.end(JSON.stringify(rows[0]["t"]));

		  });
};
