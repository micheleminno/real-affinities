const urlExists = require('url-exists');

const OK = 200;
const NOK = 404;

exports.checkUrl = function(req, res) {

	const url = req.query.url;

	urlExists(url, function(err, exists) {

		if (err) {

			console.log("Error checking url %s : ", url, err);
		} else {

			res.status(OK).json({
				url : url,
				exists : exists
			});
		}
	});
};

function refreshIndexes(res, msg, client) {

  client.indices.refresh(function(error, data) {

    if (error) {

      console.error(error);
      res.status(NOK).json({"error refreshing": error})

    } else {

      res.status(OK).json({msg: true});
    }
  });
}

exports.handleClientResponse = function(error, data, okMsg, nokMsg, res, client) {

  if (error) {

    console.error(error);
    res.status(NOK).json({nokMsg: error})
  } else {

    console.log(data);

    refreshIndexes(res, okMsg, client);
  }
}


String.prototype.deleteSubstring = function(indices) {

	return this.substring(0, indices[0]) + this.substring(indices[1]);
};
