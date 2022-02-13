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

    return this.apiService.get('/twitter/tweets?user=' + screenName)
      .map(data => [data, index]);
  }

  getProfilesWithLatestTweets(users: Profile[]): Observable<Profile[]> {

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

    var idsParam = ids.join();

    return this.apiService.get('/twitter/users?ids=' + idsParam)
      .map(data => data);
  }

  searchUsers(userQuery: string, page: number) {

    return this.apiService.get('/twitter/search/users?q=' + userQuery + "&page="
      + page)
      .map(data => data);
  }

  searchTweets(query: string, language: string, amount: number) {

    console.log("Searching tweets about an interest");

    const serviceUrl = '/twitter/search/tweets?q=' + query
            + "&lang=" + language + "&amount="
            + amount;

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl).map(data => data);
  }
}
