import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { StatusService } from '../status.service';

@Component({
  selector: 'sb-index',
  templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
  tryout = null;

  constructor (public status: StatusService, private http: Http) { }

  ngOnInit() {
    this.http.get('/api/tryout/active').subscribe(res => {
      if (res.status === 200) {
        this.tryout = res.json();
      } else {
        this.tryout = null;
      }
    });
  }
}
