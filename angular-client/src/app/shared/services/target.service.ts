import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { ApiService } from './api.service';

@Injectable()
export class TargetService {
  constructor(
    private apiService: ApiService
  ) { }


  isInTarget(profileId: string): Observable<boolean> {

    return this.apiService.get('/target/contains?id=' + profileId)
      .map(data => {

        var isPresent = data > 0 ? true : false;
        return isPresent;
      });
  }

  addToTarget(profileId: string) {

    return this.apiService.get('/target/add?id=' + profileId)
      .map(data => {

        return data ? true : false;
      });
  }

  removeFromTarget(profileId: string) {

    return this.apiService.get('/target/remove?id=' + profileId)
      .map(data => {

        return data ? true : false;
      });
  }

  getTarget() {

    return this.apiService.get('/target')
      .map(data => data.targetIds);
  }


  getInterestingUsers(offset: number, amount: number) {

    return this.apiService.get('/affinities/interesting?offset=' + offset + '&amount=' + amount)
      .map(data => data.interestingIds);
  }

  deleteTarget() {

    return this.apiService.get('/target/delete')
      .map(data => data);
  }
}
