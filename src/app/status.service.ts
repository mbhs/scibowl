import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class StatusService {
  user: any;

  constructor(private http: HttpClient) {
    this.reload();
  }

  login(username: String, password: String): Promise<any> {
    return this.http.post('/api/users/login', { username: username, password: password })
      .toPromise().then(() => this.reload());
  }

  logout(): Promise<any> {
    return this.http.post('/api/users/logout', { }).toPromise().then(() => this.reload());
  }

  reload(): Promise<any> {
    return this.http.get('/api/users/status').toPromise().then(user => this.user = user, () => this.user = null);
  }
}
