import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { StatusService } from '../status.service';

@Component({
  selector: 'sb-index',
  templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
  tryout = null;

  constructor (public status: StatusService, private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/api/tryout/active', { observe: 'response' }).subscribe(res => {
      if (res.status === 200) {
        this.tryout = res.body;
      } else {
        this.tryout = null;
      }
    });
  }
}
