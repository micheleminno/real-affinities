import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api.service';
import { Trend } from '../models';


@Injectable()
export class TrendsService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  callService(serviceUrl: string): Observable<boolean> {

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl);
  }

  loadTrends(): Observable<Trend[]>  {

    console.log("Loading all trends");

    const serviceUrl = '/trends';

    console.log("Calling service: " + serviceUrl);

    return this.apiService.get(serviceUrl)
      .map(resultData => {
        return resultData.trends;
      });
  }

  add(trend: Trend): Observable<boolean> {

    console.log("Trend to add:" + JSON.stringify(trend));

    const serviceUrl = '/trends/add?label=' + trend.label + '&query=' + trend.query;

    return this.callService(serviceUrl);
  }

  remove(trendLabel: string): Observable<boolean> {

    console.log("Removing trend " + trendLabel);

    const serviceUrl = '/trends/remove?label=' + trendLabel;

    return this.callService(serviceUrl);
  }

  update(label: string, text: string): Observable<boolean> {

    console.log("Updating trend " + label + " with text: " + text);

    const serviceUrl = '/trends/update?label=' + label + '&text=' + text;

    return this.callService(serviceUrl);
  }

  removeAllTrends() {

    console.log("Removing all trends");

    const serviceUrl = '/trends/delete';

    return this.callService(serviceUrl);
  }
}
