import { Component } from '@angular/core';

import { StatusService } from './status.service';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor (public status: StatusService) { }
}
