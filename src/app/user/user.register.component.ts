import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { StatusService } from '../status.service';

@Component({
  selector: 'sb-user-register',
  templateUrl: './user.register.component.html'
})
export class UserRegisterComponent {
  registerForm: FormGroup;

  constructor (private fb: FormBuilder, private router: Router, private status: StatusService, private http: HttpClient) {
    this.registerForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      year: ['', Validators.required]
    });
  }

  submit() {
    this.http.post('/api/users/register', {
      username: this.registerForm.controls['username'].value,
      password: this.registerForm.controls['password'].value,
      email: this.registerForm.controls['email'].value,
      name: {
        first: this.registerForm.controls['first_name'].value,
        last: this.registerForm.controls['last_name'].value
      },
      year: +this.registerForm.controls['year'].value
    }).subscribe(() => this.status.reload().then(() => this.router.navigateByUrl('/')));
  }
}
