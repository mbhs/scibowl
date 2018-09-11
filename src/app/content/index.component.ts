import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Component({
  selector: 'sb-index',
  templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
  tryout = null;

  constructor (public status: AuthService, private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/api/tryout/', { observe: 'response' }).subscribe(res => {
      if (res.status === 200) {
        this.tryout = res.body;
      } else {
        this.tryout = null;
      }
    });
  }
}
