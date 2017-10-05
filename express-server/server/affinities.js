const Twit = require('twit');
const fs = require('fs');
const async = require('async');

const db = require('./db');

const OK = 200;
const NOK = 404;

const userAccounts = JSON.parse(fs.readFileSync("./twitter-accounts.json", "utf8"));

exports.interesting = function(req, res) {

	const offset = req.query.offset;
	const amount = req.query.amount;

	db.raw('SELECT id from affinity '
				+ 'ORDER BY followed_by DESC, follows DESC LIMIT ' + offset
				+ ', ' + amount).then(function(response) {

				let ids = [];
				const rows = response[0];

				for ( let rowIndex in rows) {

					ids.push(rows[rowIndex]["id"]);
				}

				res.status(OK).json({
					interestingIds : ids
				});
		});
};

var result = {};

function getTwitter(userIndex) {

	var consumer = userAccounts[userIndex]["consumer"];
	var consumerSecret = userAccounts[userIndex]["consumerSecret"];
	var accessToken = userAccounts[userIndex]["token"];
	var accessTokenSecret = userAccounts[userIndex]["tokenSecret"];

	return new Twit({
		consumer_key : consumer,
		consumer_secret : consumerSecret,
		access_token : accessToken,
		access_token_secret : accessTokenSecret
	});
}

function updateAffinityValues(ids, relationType, add, callback) {

	console.log("updateAffinityValues(ids " + ids.length + " long, " + relationType + ", " + add
											+ ", callback)");

	var followsIncrement = 0;
	var followedByIncrement = 0;
	var initialFollowsValue = 0;
	var initialFollowedByValue = 0;

	if (add) {

		if (relationType === "followers") {

			initialFollowsValue++;
			followsIncrement++;

		} else if (relationType === "friends") {

			initialFollowedByValue++;
			followedByIncrement++;
		}
	} else { // remove, initial values are 0

		if (relationType === "followers") {

			followsIncrement--;

		} else if (relationType === "friends") {

			followedByIncrement--;
		}
	}

	async.each(ids, function(id, done) {

		var query = "INSERT INTO affinity VALUES (" + id + ", "
				+ initialFollowsValue + ", " + initialFollowedByValue
				+ ") ON DUPLICATE KEY UPDATE " + "follows = follows + "
				+ followsIncrement + ", followed_by = followed_by + "
				+ followedByIncrement;

		db.raw(query).then(function(response) {

			done();
		})
	}, function(err) {

			if (err) {

				console.log(err);
			}
			else {

				console.log("All values inserted in the db");
				callback();
			}
	});
}

function setResult(userId, nextPage, cursor, relationType, callback) {

	console.log("setResult(" + userId + ", " + nextPage + ", " + cursor
											+ ", " + relationType + ", callback)");

	if(userId === null) {

		console.log("User null");

		result = {"userId": null};
		callback(result);
	}
	else {

		var lastRetrievedPage = nextPage - 1;
		console.log("Last retrieved page: " + lastRetrievedPage);

		result[relationType]["page"] = lastRetrievedPage;
		result[relationType]["cursor"] = cursor;

		var complete = false;

		if (Object.keys(result["followers"]).length > 0
				&& Object.keys(result["friends"]).length > 0) {

					complete = true;
		}

		if(!complete) {

			console.log("Partial result: " + JSON.stringify(result));
		}
		else {

			console.log("\nAll results fetched for user " + userId);
		}

		callback(result);
	}
}

function updateAffinities(userId, nextPage, lastPageToFetch, cursor,
		credentialsIndex, relationType, add, callback) {

  console.log("updateAffinities(" + userId + ", " + nextPage + ", " + lastPageToFetch + ", " + cursor
											+ ", " + credentialsIndex + ", " + relationType + ", " + add + ", callback)");

	if (nextPage <= lastPageToFetch && cursor !== 0) {

		var twitter = getTwitter(credentialsIndex);
		twitter
				.get(
						'application/rate_limit_status',
						{
							resources : relationType
						},
						function(err, data, response) {

							var results = data.resources[relationType]['/'
									+ relationType + '/ids'];
							var remainingCalls = results['remaining'];
							var resetDate = results['reset'];

							if (remainingCalls > 0) {

								twitter
										.get(
												relationType + '/ids',
												{
													user_id : userId,
													cursor : cursor
												},
												function(err, data, response) {


													if (err) {

														console.log("Err: " + JSON.stringify(err));
														if(err.code === 34) {

															console.log("User doesn't exist on Twitter");
															setResult(null, nextPage, cursor,
																		relationType, callback);
														}
														else {

    													console
    																.log("Affinities not updated for user: "
    																		+ userId + ", page: " + nextPage);

															// retry
    													return updateAffinities(userId,
    																nextPage, lastPageToFetch,
    																cursor, credentialsIndex,
    																relationType, add, callback);
    												}

													} else {

														cursor = data.next_cursor;
														console.log("Next cursor: " + cursor);

														updateAffinityValues(
																data.ids, relationType, add,
																function() {

																	var resultSize = nextPage * 5000;
																	if(cursor === 0) {

																		resultSize = data.ids.length;
																	}
																	console
																			.log('Page n. ' + nextPage
																					+ ' - ' + resultSize
																					+ ' ' + relationType
																					+ ' ids of user ' + userId + ' retrieved');

																	return updateAffinities(userId, ++nextPage,
																			lastPageToFetch, cursor,
																			credentialsIndex, relationType,
																			add, callback);
																});
													}
												});
							} else {

								var screenName = userAccounts[credentialsIndex]["screenName"]

								console
										.log('\nRate limits reached for call /'
												+ relationType + '/ids and credentials of ' + screenName);

								var now = new Date();
								var millisecs = now.getTime();
								var lapseOfSeconds = resetDate
										- Math.floor(millisecs / 1000);

								console
										.log('These credentials will be available again for '
												+ relationType + ' in ' + lapseOfSeconds + ' seconds');

								credentialsIndex++;
								if (credentialsIndex < userAccounts.length) {

									return updateAffinities(userId, nextPage,
											lastPageToFetch, cursor,
											credentialsIndex, relationType,
											add, callback);

								} else {

									console
											.log("\nAll credentials exploited for relation type "
													+ relationType);

									setResult(userId, nextPage, cursor,
											relationType, callback);
								}
							}
						});
	} else {

		console.log("\nAll requested data fetched for relation type "
				+ relationType + " and user " + userId);

			setResult(userId, nextPage, cursor, relationType, callback);
	}
}

exports.add = function(userId, callback) {

	result = {
		"userId" : userId,
		"followers" : {},
		"friends" : {}
	};

	console.log("Update followers affinities");

	updateAffinities(userId, 1, 15, -1, 0, 'followers', true,
			function(result) {

				console.log("Followers affinities updated");
				if(result.userId !== null) {

					console.log("Update friends affinities");
					updateAffinities(userId, 1, 15, -1, 0, 'friends', true, callback);
				}
				else {

					console.log("User id null");
					callback(result);
				}
			});
};

exports.remove = function(userId, callback) {

	result = {
		"userId" : userId,
		"followers" : {},
		"friends" : {}
	};

	db.from('target')
		.where('id', userId)
		.then(function(rows) {

			if (rows.length > 0) {

				var followersPagesAmount = rows[0]["last_followers_page"];
				var friendsPagesAmount = rows[0]["last_friends_page"];

				var fetchLimits = {
					"followers" : followersPagesAmount,
					"friends" : friendsPagesAmount
				};

				updateAffinities(userId, 1, fetchLimits['followers'], -1,
						0, 'followers', false, function(result) {

							if(result.userId !== null) {

								updateAffinities(userId, 1, fetchLimits['friends'], -1,
										0, 'friends', false, callback);
							}
							else {

								console.log("User id null");
								callback(result);
							}
				});
			} else {
				// User doesn't exist, nothing to do
			}
	});
};
