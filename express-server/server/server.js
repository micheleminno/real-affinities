const express = require('express');
const cors = require('cors');

const target = require('./target');
const profiles = require('./profiles');
const affinities = require('./affinities');
const interests = require('./interests');
const twitter = require('./twitter');
const utilities = require('./utilities');

const app = express();

app.use(cors());

app.get('/', function(req, res) {

  console.log("Server is working!");
  res.send('Welcome');
});

app.get('/target', target.list);
app.get('/target/add', target.add);
app.get('/target/remove', target.remove);
app.get('/target/delete', target.removeAll);
app.get('/target/contains', target.contains);

app.get('/profiles/load', profiles.load);
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

const server = app.listen(3000, function() {

  console.log("Listening to port %s", server.address().port);
});

module.exports = server;
