const utilities = require('./utilities');

const Twit = require('twit');
const fs = require("fs");
const bigInt = require("big-integer");

const natural = require('natural');
const TfIdf = natural.TfIdf,
  tfidf;

const OK = 200;
const ERROR = 400;
const TOO_MANY_REQUESTS = 429;

const NUMBERS_REGEXP = /\b(\d+)\b/g;

const HASHTAGS = 'hashtags';
const TEXT = 'text';
const USER_MENTIONS = 'user_mentions';
const USER = 'user';
const SCREEN_NAME = 'screen_name';
const URLS = 'urls';
const URL = 'url';
const EXPANDED_URL = 'expanded_url';
const RETWEETS = 'retweets';
const RETWEET_COUNT = 'retweet_count';
const RETWEETED_STATUS = 'retweeted_status';

const UNIGRAMS = 'unigrams';

const HASHTAGS_AMOUNT = 20;
const MENTIONS_AMOUNT = 10;
const URLS_AMOUNT = 3;
const RETWEETS_AMOUNT = 3;
const UNIGRAMS_AMOUNT = 100;

const userAccounts = JSON.parse(fs.readFileSync("./twitter-accounts.json", "utf8"));

function getTwitter(userIndex) {

  return new Twit({consumer_key: userAccounts[userIndex]["consumer"], consumer_secret: userAccounts[userIndex]["consumerSecret"], access_token: userAccounts[userIndex]["token"], access_token_secret: userAccounts[userIndex]["tokenSecret"]
  });
}

function getSortedKeys(obj) {

  let keys = [];
  for (let key in obj) {

    keys.push(key);
  }
  return keys.sort(function(a, b) {
    return obj[b] - obj[a];
  });
};

function sendResponse(resultBox, response) {

  console.log("\n\n*******" + HASHTAGS + "*******\n");
  const hashtagsText = getText(resultBox[HASHTAGS], HASHTAGS_AMOUNT);

  console.log("\n\n*******" + USER_MENTIONS + "*******\n");
  const mentionsText = getText(resultBox[USER_MENTIONS], MENTIONS_AMOUNT);

  console.log("\n\n*******" + RETWEETS + "*******\n");
  const retweetsText = getText(resultBox[RETWEETS], RETWEETS_AMOUNT);

  console.log("\n\n*******" + URLS + "*******\n");
  const urlsText = getText(resultBox[URLS], URLS_AMOUNT);

  console.log("\n\n*******" + UNIGRAMS + "*******\n");
  const unigramsText = getText(resultBox[UNIGRAMS], UNIGRAMS_AMOUNT);

  const text = hashtagsText + " " + mentionsText + " " + retweetsText + " " + urlsText + " " + unigramsText;

  console.log("\nResult: " + text);

  response.status(OK).json({value: text});
};

function getText(occurrences, amount) {

  const sortedItems = getSortedKeys(occurrences);

  let text = '';

  for (let sortedItemIndex in sortedItems) {

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

  const stopwords = JSON.parse(fs.readFileSync("./stopwords.json", "utf8"));

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

  const resultText = tweet.text;
  let entitiesIndices = {};

  // Hashtags

  tweet.entities.hashtags.forEach(function(hashtag) {

    if (resultBox[HASHTAGS][hashtag[TEXT]]) {

      resultBox[HASHTAGS][hashtag[TEXT]]++;

    } else {

      resultBox[HASHTAGS][hashtag[TEXT]] = 1;
    }

    const startIndex = hashtag['indices'][0];
    const endIndex = hashtag['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  // User mentions

  tweet.entities.user_mentions.forEach(function(userMention) {

    if (resultBox[USER_MENTIONS][userMention[SCREEN_NAME]]) {

      resultBox[USER_MENTIONS][userMention[SCREEN_NAME]]++;

    } else {

      resultBox[USER_MENTIONS][userMention[SCREEN_NAME]] = 1;
    }

    const startIndex = userMention['indices'][0];
    const endIndex = userMention['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  // Urls

  tweet.entities.urls.forEach(function(url) {

    if (resultBox[URLS][url[EXPANDED_URL]]) {

      resultBox[URLS][url[EXPANDED_URL]]++;

    } else {

      resultBox[URLS][url[EXPANDED_URL]] = 1;
    }

    const startIndex = url['indices'][0];
    const endIndex = url['indices'][1];
    entitiesIndices[startIndex] = endIndex;
  });

  let offset = 0;

  for (let startIndex in entitiesIndices) {

    const endIndex = entitiesIndices[startIndex];
    const newIndices = [
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
  let text = updateEntities(tweet, resultBox);

  // remove numbers
  text = text.replace(NUMBERS_REGEXP, '');

  tfidf.addDocument(text);
  updateUnigrams(tfidf, language, docIndex, resultBox);
}

function callTweetSearch(method, options, credentialIndex, response, docIndex, resultBox, tweetAmount) {

  console.log(docIndex + " tweets found");

  const twitter = getTwitter(credentialIndex);
  twitter.get(method, options, function(err, data, twitterResponse) {

    const credentialsUser = userAccounts[credentialIndex]["screenName"];
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

      const tweets = data.statuses;

      if (tweets.length == 0) {

        sendResponse(resultBox, response);

      } else {

        const minId = bigInt(tweets[0].id_str);

        const firstTweetDate = tweets[0].created_at.substring(4, 19);

        console.log("\nReached tweets written on date: " + firstTweetDate);

        for (let tweetIndex in tweets) {

          const stringId = tweets[tweetIndex].id_str;

          const id = bigInt(stringId);
          if (id.compareTo(minId) < 0) {
            minId = id;
          }

          var currentDocIndex = parseInt(docIndex) + parseInt(tweetIndex);

          updateResults(tfidf, options.lang, currentDocIndex, tweets[tweetIndex], resultBox);
        }

        const amount = tweets.length;

        newDocIndex = docIndex + amount;

        const nextMaxId = minId.prev();
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

  const q = req.query.q;
  const lang = req.query.lang;
  const tweetAmount = req.query.amount;

  console.log("Searching up to " + tweetAmount + " tweets");

  const method = 'search/tweets';
  const options = {
    q: q,
    count: 100,
    lang: lang
  };

  tfidf = new TfIdf();
  const emptyResultBox = {

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

  console.log("call " + method + " with parameters " + JSON.stringify(options)
							+ " and with credentials index =  " + credentialIndex);

  const twitter = getTwitter(credentialIndex);
  twitter.get(method, options, function(err, data, twitterResponse) {

    const credentialsUser = userAccounts[credentialIndex]["screenName"];
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

  const q = req.query.q;
  const count = req.query.count;
	const page = req.query.page;

  const method = 'users/search';
  const options = {
    q: q,
    count: count,
    page: page
  };

  call(method, options, 0, res);
};

exports.userTweets = function(req, res) {

  const user = req.query.user;

  const method = 'statuses/user_timeline';
  const options = {
    screen_name: user,
    count: 100
  };

  call(method, options, 0, res);
};

exports.users = function(req, res) {

  const ids = req.query.ids;

  const method = 'users/lookup';
  const options = {
    user_id: ids
  };

  call(method, options, 0, res);
};
