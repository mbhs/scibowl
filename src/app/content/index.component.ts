import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { AuthService } from '../auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'sb-index',
  templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {
  tryouts = null;
  joinFailed = false;
  joinForm: FormGroup;
  newTeamForm: FormGroup;

  constructor (public status: AuthService, private http: HttpClient, private fb: FormBuilder) {
    this.joinForm = fb.group({
      code: ['', Validators.required]
    });
    this.newTeamForm = fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.http.get('/api/tryout/', { observe: 'response' }).subscribe(res => this.tryouts = res.body);
  }

  join() {
    this.http.post('/api/teams/join', { code: this.joinForm.controls['code'].value },
      { observe: 'response' }).subscribe(() => this.status.reload(),
      () => this.joinFailed = true);
  }

  newTeam() {
    this.http.post('/api/teams/new', { name: this.newTeamForm.controls['name'].value },
      { observe: 'response' }).subscribe(() => this.status.reload());
  }
}
