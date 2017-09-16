import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { StatusService } from '../status.service';

@Component({
  selector: 'sb-user-login',
  templateUrl: './user.login.component.html'
})
export class UserLoginComponent {
  loginForm: FormGroup;
  failed: Boolean = false;

  constructor (private fb: FormBuilder, private router: Router, private status: StatusService) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    this.status.login(this.loginForm.controls['username'].value, this.loginForm.controls['password'].value).then(
      () => {
        this.router.navigateByUrl('/');
      }, () => {
        this.failed = true;
      }
    );
  }
}
