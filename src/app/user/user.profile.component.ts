import { Component } from '@angular/core';

import { Config } from '../config.service'
import { StatusService } from '../status.service';

@Component({
  selector: 'user-profile',
  templateUrl: './user.profile.component.html'
})
export class UserProfileComponent {
  constructor(public status: StatusService, public config: Config) { }
}
