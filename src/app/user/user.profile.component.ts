import { Component } from '@angular/core';

import { Config } from '../config.service';
import { AuthService } from '../auth.service';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'sb-user-profile',
  templateUrl: './user.profile.component.html'
})
export class UserProfileComponent {
  rounds;
  constructor(public status: AuthService, public config: Config, public http: HttpClient) {
    this.http.get("/api/rounds").subscribe(rounds => this.rounds = rounds);
  }
}
