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

  callService(serviceUrl) {

    console.log("Calling service: " + serviceUrl);
    
    return this.apiService.get(serviceUrl);
  }

  add(interest: Interest): Observable<boolean> {

    const serviceUrl = '/interest/add?name=' + interest.name + '&query=' + interest.query;

    callService(serviceUrl);
  }

  remove(interestName: string): Observable<boolean> {

    const serviceUrl = '/interest/remove?name=' + interestName;

    callService(serviceUrl);
  }

  update(name: string, text: string): Observable<boolean> {

    const serviceUrl = '/interest/update?name=' + name + '&text=' + text;

    callService(serviceUrl);
  }
}
