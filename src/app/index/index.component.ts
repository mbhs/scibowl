import { Component } from '@angular/core';

import { StatusService } from '../status.service';

@Component({
  selector: 'sb-index',
  templateUrl: './index.component.html'
})
export class IndexComponent {
  constructor (private status: StatusService) { }
}
