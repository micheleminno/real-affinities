var utilities = require('./utilities');

var Twit = require('twit');
var fs = require("fs");
var bigInt = require("big-integer");

var natural = require('natural');
var TfIdf = natural.TfIdf,
  tfidf;

var OK = 200;
var ERROR = 400;
var TOO_MANY_REQUESTS = 429;

var NUMBERS_REGEXP = /\b(\d+)\b/g;

var HASHTAGS = 'hashtags';
var TEXT = 'text';
var USER_MENTIONS = 'user_mentions';
var USER = 'user';
var SCREEN_NAME = 'screen_name';
var URLS = 'urls';
var URL = 'url';
var EXPANDED_URL = 'expanded_url';
var RETWEETS = 'retweets';
var RETWEET_COUNT = 'retweet_count';
var RETWEETED_STATUS = 'retweeted_status';

var UNIGRAMS = 'unigrams';

var HASHTAGS_AMOUNT = 20;
var MENTIONS_AMOUNT = 10;
var URLS_AMOUNT = 3;
var RETWEETS_AMOUNT = 3;
var UNIGRAMS_AMOUNT = 100;

var userAccounts = JSON.parse(fs.readFileSync("./twitter-accounts.json", "utf8"));

function getTwitter(userIndex) {

  return new Twit({consumer_key: userAccounts[userIndex]["consumer"], consumer_secret: userAccounts[userIndex]["consumerSecret"], access_token: userAccounts[userIndex]["token"], access_token_secret: userAccounts[userIndex]["tokenSecret"]
  });
}

function getSortedKeys(obj) {

  var keys = [];
  for (var key in obj) {

    keys.push(key);
  }
  return keys.sort(function(a, b) {
    return obj[b] - obj[a];
  });
};

function sendResponse(resultBox, response) {

  console.log("\n\n*******" + HASHTAGS + "*******\n");
  var hashtagsText = getText(resultBox[HASHTAGS], HASHTAGS_AMOUNT);

  console.log("\n\n*******" + USER_MENTIONS + "*******\n");
  var mentionsText = getText(resultBox[USER_MENTIONS], MENTIONS_AMOUNT);

  console.log("\n\n*******" + RETWEETS + "*******\n");
  var retweetsText = getText(resultBox[RETWEETS], RETWEETS_AMOUNT);

  console.log("\n\n*******" + URLS + "*******\n");
  var urlsText = getText(resultBox[URLS], URLS_AMOUNT);

  console.log("\n\n*******" + UNIGRAMS + "*******\n");
  var unigramsText = getText(resultBox[UNIGRAMS], UNIGRAMS_AMOUNT);

  var text = hashtagsText + " " + mentionsText + " " + retweetsText + " " + urlsText + " " + unigramsText;

  console.log("\nResult: " + text);

  response.status(OK).json({value: text});
};

function getText(occurrences, amount) {

  var sortedItems = getSortedKeys(occurrences);
  var text = '';
  for (sortedItemIndex in sortedItems) {

    if (sortedItemIndex < amount) {

      text += sortedItems[sortedItemIndex] + ' ';
      console.log(sortedItems[sortedItemIndex]);

    } else {
      break;
    }
  }

  text = text.substring(0, text.length - 1);

  return text;
};

function isStopword(word, lang) {

  var stopwords = JSON.parse(fs.readFileSync("./stopwords.json", "utf8"));
  if (stopwords[lang]) {
    return stopwords[lang].indexOf(word) > -1;
  }

  return false;
};

function updateEntities(tweet, resultBox) {

  if (tweet[RETWEETED_STATUS]) {

    tweet = tweet[RETWEETED_STATUS];

    if (resultBox[RETWEETS][tweet[TEXT]]) {

      resultBox[RETWEETS][tweet[TEXT]]++;

    } else {

      resultBox[RETWEETS][tweet[TEXT]] = 1;
    }
  }

  var resultText = tweet.text;
  var entitiesIndices = {};

  // Hashtags

  tweet.entities.hashtags.forEach(function(hashtag) {

    if (resultBox[HASHTAGS][hashtag[TEXT]]) {

      resultBox[HASHTAGS][hashtag[TEXT]]++;

    } else {

      resultBox[HASHTAGS][hashtag[TEXT]] = 1;
    }

    var startIndex = hashtag['indices'][0];
    var endIndex = hashtag['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  // User mentions

  tweet.entities.user_mentions.forEach(function(userMention) {

    if (resultBox[USER_MENTIONS][userMention[SCREEN_NAME]]) {

      resultBox[USER_MENTIONS][userMention[SCREEN_NAME]]++;

    } else {

      resultBox[USER_MENTIONS][userMention[SCREEN_NAME]] = 1;
    }

    var startIndex = userMention['indices'][0];
    var endIndex = userMention['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  // Urls

  tweet.entities.urls.forEach(function(url) {

    if (resultBox[URLS][url[EXPANDED_URL]]) {

      resultBox[URLS][url[EXPANDED_URL]]++;

    } else {

      resultBox[URLS][url[EXPANDED_URL]] = 1;
    }

    var startIndex = url['indices'][0];
    var endIndex = url['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  var offset = 0;

  for (var startIndex in entitiesIndices) {

    var endIndex = entitiesIndices[startIndex];
    var newIndices = [
      startIndex - offset,
      endIndex - offset
    ];
    resultText = resultText.deleteSubstring(newIndices);
    offset += endIndex - startIndex;
  }

  return resultText;
}

function updateUnigrams(tfidf, language, docIndex, resultBox) {

  tfidf.listTerms(docIndex).forEach(function(item) {

    if (!isStopword(item.term, language)) {

      if (resultBox[UNIGRAMS][item.term]) {

        resultBox[UNIGRAMS][item.term] = resultBox[UNIGRAMS][item.term] + item.tfidf;
      } else {

        resultBox[UNIGRAMS][item.term] = item.tfidf;
      }
    }
  });
}

function updateResults(tfidf, language, docIndex, tweet, resultBox) {

  // remove entities and update them
  var text = updateEntities(tweet, resultBox);

  // remove numbers
  text = text.replace(NUMBERS_REGEXP, '');

  tfidf.addDocument(text);
  updateUnigrams(tfidf, language, docIndex, resultBox);
}

function callTweetSearch(method, options, credentialIndex, response, docIndex, resultBox, tweetAmount) {

  console.log(docIndex + " tweets found");

  var twitter = getTwitter(credentialIndex);
  twitter.get(method, options, function(err, data, twitterResponse) {

    var credentialsUser = userAccounts[credentialIndex]["screenName"];
    if (err) {

      if (err.code == 88) {
        console.log("Rate limits exceeded for call " + method + " and credentials of " + credentialsUser);
        credentialIndex++;
        if (userAccounts.length > credentialIndex) {

          credentialsUser = userAccounts[credentialIndex]["screenName"];
          console.log("Trying with credentials of " + credentialsUser);

          callTweetSearch(method, options, credentialIndex, response, docIndex, resultBox, tweetAmount);

        } else {
          console.log("All credentials used");
          response.status(TOO_MANY_REQUESTS);
        }
      } else {
        response.status(ERROR);
      }
    } else {

      var tweets = data.statuses;

      if (tweets.length == 0) {

        sendResponse(resultBox, response);

      } else {

        var minId = bigInt(tweets[0].id_str);

        var firstTweetDate = tweets[0].created_at.substring(4, 19);

        console.log("\nReached tweets written on date: " + firstTweetDate);

        for (tweetIndex in tweets) {

          var stringId = tweets[tweetIndex].id_str;

          var id = bigInt(stringId);
          if (id.compareTo(minId) < 0) {
            minId = id;
          }

          var currentDocIndex = parseInt(docIndex) + parseInt(tweetIndex);

          updateResults(tfidf, options.lang, currentDocIndex, tweets[tweetIndex], resultBox);
        }

        var amount = tweets.length;

        newDocIndex = docIndex + amount;

        var nextMaxId = minId.prev();
        options.max_id = nextMaxId.toString();

        if (newDocIndex < tweetAmount) {

          callTweetSearch(method, options, credentialIndex, response, newDocIndex, resultBox, tweetAmount);
        } else {

          sendResponse(resultBox, response);
        }
      }
    }
  });
}

exports.searchTweets = function(req, res) {

  var q = req.query.q;
  var lang = req.query.lang;
  var tweetAmount = req.query.amount;

  console.log("Searching up to " + tweetAmount + " tweets");

  var method = 'search/tweets';
  var options = {
    q: q,
    count: 100,
    lang: lang
  };

  tfidf = new TfIdf();
  var emptyResultBox = {

    hashtags: {},
    retweets: {},
    user_mentions: {},
    urls: {},
    unigrams: {},
    bigrams: {},
    trigrams: {}
  };

  callTweetSearch(method, options, 0, res, 0, emptyResultBox, tweetAmount);
};

function call(method, options, credentialIndex, response) {

  console.log("call " + method + " with parameters: " + JSON.stringify(options)
							+ " with credentials index =  " + credentialIndex);

  var twitter = getTwitter(credentialIndex);
  twitter.get(method, options, function(err, data, twitterResponse) {

    var credentialsUser = userAccounts[credentialIndex]["screenName"];
    if (err) {

      if (err.code == 88) {
        console.log("Rate limits exceeded for call " + method + " and credentials of " + credentialsUser);
        credentialIndex++;
        if (userAccounts.length > credentialIndex) {

          credentialsUser = userAccounts[credentialIndex]["screenName"];
          console.log("Trying with credentials of " + credentialsUser);
          call(method, options, credentialIndex, response);

        } else {
          console.log("All credentials used");
          response.status(TOO_MANY_REQUESTS);
        }
      } else {

        console.log(JSON.stringify(err));
        response.status(ERROR);
      }
    } else {

      console.log("Call " + method + " done with credentials of " + credentialsUser);

      response.status(OK).json(data);
    }
  });
}

exports.searchUsers = function(req, res) {

  var q = req.query.q;
  var count = req.query.count;
	var page = req.query.page;

  var method = 'users/search';
  var options = {
    q: q,
    count: count,
    page: page
  };

  call(method, options, 0, res);
};

exports.userTweets = function(req, res) {

  var user = req.query.user;

  var method = 'statuses/user_timeline';
  var options = {
    screen_name: user,
    count: 100
  };

  call(method, options, 0, res);
};

exports.users = function(req, res) {

  var ids = req.query.ids;

  var method = 'users/lookup';
  var options = {
    user_id: ids
  };

  call(method, options, 0, res);
};
