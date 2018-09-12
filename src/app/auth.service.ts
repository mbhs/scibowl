import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';


export const ROLES = { public: 0, student: 1, member: 2, captain: 3, deity: 4 };

@Injectable()
export class AuthService implements CanActivate {
  user: any;
  team: any;

  constructor(private http: HttpClient, private router: Router) {
    this.reload().then(() => { return; });
  }

  login(username: String, password: String): Promise<any> {
    return this.http.post('/api/users/login', { username: username, password: password })
      .toPromise().then(() => this.reload());
  }

  logout(): Promise<any> {
    return this.http.post('/api/users/logout', { }).toPromise().then(() => this.reload());
  }

  reload(): Promise<any> {
    return this.http.get('/api/users/status').toPromise()
      .then(status => {
        this.user = status.user;
        this.team = status.team;
      }, () => {
        this.user = null;
        this.team = null;
      });
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let authorized = true;
    if (!this.user) {
      authorized = false;
    } else if (route.data.expectedRole) {
      authorized = this.user.role >= ROLES[route.data.role];
    }
    if (!authorized) {
      this.router.navigate(['user/login']);
    }
    return authorized;
  }
}
