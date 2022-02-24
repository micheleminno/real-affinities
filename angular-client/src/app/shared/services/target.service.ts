import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { ApiService } from './api.service';

@Injectable()
export class TargetService {
  constructor(
    private apiService: ApiService
  ) { }


  isInTarget(profileId: string): Observable<boolean> {

    console.log("Asking if profile with id " + profileId + " is in target");

    const serviceUrl = '/target/contains?id=' + profileId;

    return this.apiService.get(serviceUrl)
      .map(data => {
        var isPresent = data > 0 ? true : false;
        return isPresent;
      });
  }

  addToTarget(profileId: string) {

    console.log("Adding profile with id " + profileId + " to target");

    const serviceUrl = '/target/add?id=' + profileId;

    return this.apiService.get(serviceUrl)
      .map(data => {
        return data["User added"] ? true : false;
      });
  }

  removeFromTarget(profileId: string) {

    console.log("Removing profile with id " + profileId + " from target");

    const serviceUrl = '/target/remove?id=' + profileId;

    return this.apiService.get(serviceUrl)
      .map(data => {

        return data ? true : false;
      });
  }

  getTarget() {

    console.log("Getting all profile ids in target");

    const serviceUrl = '/target';

    return this.apiService.get(serviceUrl)
      .map(data => data.targetIds);
  }


  getInterestingUsers(offset: number, amount: number) {

    console.log("Getting interesting profiles");

    const serviceUrl = '/affinities/interesting?offset=' + offset + '&amount=' + amount;

    return this.apiService.get(serviceUrl)
      .map(data => data.interestingIds);
  }

  deleteTarget() {

    console.log("Deleting target");

    const serviceUrl = '/target/delete';

    return this.apiService.get(serviceUrl)
      .map(data => data);
  }
}
