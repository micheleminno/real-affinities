import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';

import { ApiService } from './api.service';
import { Profile } from '../models';

@Injectable()
export class TwitterService {
  constructor(
    private apiService: ApiService
  ) { }

  getProfileLatestTweets(screenName: string, index: string) {

    console.log("Getting latest tweets of user " + screenName);

    const serviceUrl = '/twitter/tweets?user=' + screenName;

    return this.apiService.get(serviceUrl).map(data => [data, index]);
  }

  getProfilesWithLatestTweets(users: Profile[]): Observable<Profile[]> {

    console.log("Getting latest tweets of some profiles");

    var filledUsers = [];
    for (var profileIndex in users) {

      filledUsers[profileIndex] = this.getProfileLatestTweets(users[profileIndex].screen_name, profileIndex).map(
        data => {

          var tweets = data[0];
          var index = data[1];
          users[index]["tweets"] = tweets;

          return users[index];
        }
      );
    }

    return Observable.forkJoin(filledUsers);
  };

  lookupUsers(ids: string[]) {

    console.log("Looking up some users");

    var idsParam = ids.join();
    const serviceUrl = '/twitter/users?ids=' + idsParam;

    return this.apiService.get(serviceUrl).map(data => data);
  }

  searchUsers(userQuery: string, page: number) {

    console.log("Searching users by some keywords");

    const serviceUrl = '/twitter/search/users?q=' + userQuery + "&page=" + page;

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl).map(data => data);
  }

  searchTweets(query: string, language: string, amount: number): Observable<string> {

    console.log("Searching tweets about an interest");

    const serviceUrl = '/twitter/search/tweets?q=' + query
            + "&lang=" + language + "&amount=" + amount;

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl)
              .map(resultData => {
                return resultData.value;
              });
  }
}
