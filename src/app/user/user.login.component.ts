import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'sb-user-login',
  templateUrl: './user.login.component.html'
})
export class UserLoginComponent {
  loginForm: FormGroup;
  failed: Boolean = false;
  nextLink = "/";

  constructor (private fb: FormBuilder, private router: Router,
               private route: ActivatedRoute, private status: AuthService) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.route.params.subscribe(params => {
      if (params['next']) this.nextLink = params['next'];
    });
  }

  submit() {
    this.status.login(this.loginForm.controls['username'].value, this.loginForm.controls['password'].value).then(
      () => {
        console.log(this.nextLink);
        this.router.navigateByUrl(this.nextLink);
      }, () => {
        this.failed = true;
      }
    );
  }
}
