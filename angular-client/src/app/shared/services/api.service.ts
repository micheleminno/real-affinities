import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  private setHeaders(): HttpHeaders {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return new HttpHeaders(headersConfig);
  }

  private formatErrors(error: any) {
    return Observable.throw(error);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {

    return this.http.get(`${environment.api_url}${path}`, { headers: this.setHeaders(), params: params })
      .catch(this.formatErrors)
      .map((res: HttpResponse<any>) => res);
  }

  put(path: string, body: Object = {}): Observable<any> {

    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    )
      .catch(this.formatErrors)
      .map((res: HttpResponse<any>) => res);
  }

  post(path: string, body: Object = {}): Observable<any> {

    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    )
      .catch(this.formatErrors)
      .map((res: HttpResponse<any>) => res);
  }

  delete(path): Observable<any> {

    return this.http.delete(
      `${environment.api_url}${path}`,
      { headers: this.setHeaders() }
    )
      .catch(this.formatErrors)
      .map((res: HttpResponse<any>) => res);
  }
}
