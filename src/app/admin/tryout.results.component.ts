import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Config } from '../config.service';

@Component({
  selector: 'sb-tryout-results',
  templateUrl: './tryout.results.component.html'
})
export class TryoutResultsComponent {
  tryouts = null;

  constructor (private http: HttpClient, public config: Config) {
    // this.http.get('/api/admin/tryouts').map(res => res.json()).subscribe(tryouts => this.tryouts = tryouts);
  }
}
