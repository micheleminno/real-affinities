const urlExists = require('url-exists');

const OK = 200;

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

String.prototype.deleteSubstring = function(indices) {

	return this.substring(0, indices[0]) + this.substring(indices[1]);
};
