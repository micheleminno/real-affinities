# Real affinities
Dockerized EEAN web application (Elasticsearch, Express.js, Angular2, Node.js). It allows you to search for useful Twitter profiles (by interest or network proximity).

Browse among Twitter users in order to find users similar to your target.
You can set initial target users and interests.

You don't need to have a Twitter account or login into yours.

You can search Twitter users giving a certain string in input.
Or, if you already know, entering the username of an existing Twitter user.

## Setup

- Download the git project:
  
  ```
  git clone https://github.com/micheleminno/real-affinities.git
  ```
  
- Add a JSON file called ```twitter-accounts.json``` in the express-server folder with the Twitter user credentials used to call the Twitter APIs. The file has to be the following format:
  
  ```
  [
    {
      "screenName":"xxx",
      "consumer":"yyy",
      "consumerSecret":"zzz",
      "token":"www",
      "tokenSecret":"jjj"
    },
    ...
  ]
  ```
  
- Run the project:
  
  ```
  docker-compose -f docker-compose.yml -p ci up --build
  ```
  
- Wait for Elastic Search and Kibana to be up and running and create the index. Go to http://localhost:5601 -> Dev Tools and run the following query:
  
  ```
  PUT real-affinities
  {
    "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1
    },
    "mappings": {
      "profile": {
        "properties": {
          "name": {
            "type": "text"
          },
          "query": {
            "type": "text"
          },
          "is_interest": {
            "type": "boolean"
          }
        }
      }
    }
  }
  ```
  
- You're done! Go to http://localhost:4200 to see the app. If you want to call the server APIs, server runs at http://localhost:3000.
