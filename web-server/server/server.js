var express = require('express');

var target = require('./target');
var profiles = require('./profiles');
var affinities = require('./affinities');
var interests = require('./interests');
var twitter = require('./twitter');
var utilities = require('./utilities');

var app = express();
module.exports = app;

var allowCrossDomain = function(req, res, next) {

	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods',
			'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers',
			'X-Requested-With,content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);

	next();
};

app.use(allowCrossDomain);

app.get('/', function(req, res) {
	res.send('Welcome');
});

app.get('/target', target.list);
app.get('/target/add', target.add);
app.get('/target/remove', target.remove);
app.get('/target/delete', target.removeAll);
app.get('/target/contains', target.contains);

app.get('/profiles/index', profiles.index);
app.get('/profiles/matching', profiles.matching);

app.get('/affinities/interesting', affinities.interesting);

app.get('/interests', interests.list);
app.get('/interests/add', interests.add);
app.get('/interests/remove', interests.remove);
app.get('/interests/delete', interests.removeAll);
app.get('/interests/update', interests.update);
app.get('/interests/getProfiles', interests.getMatchingProfiles);

app.get('/twitter/search/users', twitter.searchUsers);
app.get('/twitter/search/tweets', twitter.searchTweets);
app.get('/twitter/tweets', twitter.userTweets);
app.get('/twitter/users', twitter.users);

app.get('/utilities/url-exists', utilities.checkUrl);

var server = {};

server = app.listen(3000, function() {

	console.log("Listening to port %s", server.address().port);
});
