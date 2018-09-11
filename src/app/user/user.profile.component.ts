import { Component } from '@angular/core';

import { Config } from '../config.service'
import { AuthService } from '../auth.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user.profile.component.html'
})
export class UserProfileComponent {
  constructor(public status: AuthService, public config: Config) { }
}
