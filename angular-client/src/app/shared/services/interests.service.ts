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

  add(interest: Interest): Observable<boolean> {

    return this.apiService
      .get('/interest/add?name=' + interest.name + '&query=' + interest.query);
  }

  remove(interestName: string): Observable<boolean> {

    return this.apiService
      .get('/interest/remove?name=' + interestName);
  }

  update(name: string, text: string): Observable<boolean> {

    return this.apiService
      .get('/interest/update?name=' + name + '&text=' + text);
  }
}
