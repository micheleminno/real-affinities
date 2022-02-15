import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api.service';
import { Interest } from '../models';


@Injectable()
export class InterestsService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  callService(serviceUrl: string): Observable<boolean> {

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl);
  }

  loadInterests(): Observable<Interest[]>  {

    console.log("Loading all interests");

    const serviceUrl = '/interests';

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl)
      .map(resultData => {
        return resultData.interests;
      });
  }

  add(interest: Interest): Observable<boolean> {

    console.log("Interest to add:" + JSON.stringify(interest));

    const serviceUrl = '/interests/add?name=' + interest.name + '&query=' + interest.query;

    return this.callService(serviceUrl);
  }

  remove(interestName: string): Observable<boolean> {

    console.log("Removing interest " + interestName);

    const serviceUrl = '/interest/remove?name=' + interestName;

    return this.callService(serviceUrl);
  }

  update(name: string, text: string): Observable<boolean> {

    console.log("Updating interest " + name + " with text: " + text);

    const serviceUrl = '/interest/update?name=' + name + '&text=' + text;

    return this.callService(serviceUrl);
  }
}
