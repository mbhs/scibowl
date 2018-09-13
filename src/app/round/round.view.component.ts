import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";

@Component({
  selector: 'sb-round-view',
  templateUrl: './round.view.component.html'
})
export class RoundViewComponent implements OnInit {
  questions: any;
  roundId = null;
  roundForm: FormGroup;
  newRound = false;
  editing = false;
  constructor (private route: ActivatedRoute, public http: HttpClient, private fb: FormBuilder,
               public auth: AuthService, private router: Router) {
    this.roundForm = fb.group({
      title: ['', Validators.required],
      source: ['', Validators.required],
      tryout: [false],
      start: [''],
      end: ['']
    });
  }
  ngOnInit() {
    this.route.params.subscribe(params => {
      if (this.roundId === 'new') {
        this.editing = true;
        this.newRound = true;
      } else {
        this.roundId = params['id'];
        if (this.roundId) this.http.get(`/api/rounds/${this.roundId}`).subscribe(round => {
          this.questions = round['questions'];
          this.roundForm.controls['title'].setValue(round['title']);
          this.roundForm.controls['source'].setValue(round['source']);
          this.roundForm.controls['tryout'].setValue(round['kind'] === "Tryout");
          if (round['kind'] === 'Tryout') {
            this.roundForm.controls['start'].setValue(round['start'].slice(0, -8));
            this.roundForm.controls['end'].setValue(round['end'].slice(0, -8));
          }
        });
      }
    });
  }
  submit() {
    const data = {
      title: this.roundForm.controls['title'].value,
      source: this.roundForm.controls['source'].value,
      kind: this.roundForm.controls['tryout'].value ? "Tryout" : "",
      start: this.roundForm.controls['source'].value,
      end: this.roundForm.controls['end'].value,
      questions: this.questions
    };

    if (this.newRound) {
      this.http.post('/api/rounds/new', data).subscribe(res => {
        this.router.navigateByUrl(`/round/${res['id']}`);
      });
    } else {
      this.http.post(`/api/rounds/${this.roundId}`, data).subscribe(() => this.editing = false);
    }
  }
  removeQuestion(i) {
    this.questions.splice(i, 1);
  }
  swapAt(i) {
    let temp = this.questions[i];
    this.questions[i] = this.questions[i + 1];
    this.questions[i + 1] = temp;
  }
}
