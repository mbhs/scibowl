import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { StatusService } from './status.service';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor (public status: StatusService, private router: Router) { }

  logout() {
    this.status.logout().then(() => this.router.navigateByUrl('/'));
  }
}
