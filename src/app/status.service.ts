import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class StatusService {
  user: any;

  constructor(private http: Http) {
    this.reload();
  }

  login(username: String, password: String): Promise<any> {
    return this.http.post('/api/users/login', { username: username, password: password })
      .map(res => res.json()).toPromise().then(() => this.reload());
  }

  logout(): Promise<any> {
    return this.http.post('/api/users/logout', { }).map(res => res.json()).toPromise().then(() => this.reload());
  }

  reload() {
    this.http.get('/api/users/status').map(res => res.json()).subscribe(user => this.user = user, () => this.user = null);
  }
}
