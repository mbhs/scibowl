import { Component } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { CHOICES } from '../game';


@Component({
  selector: 'sb-tryout',
  templateUrl: './tryout.component.html'
})
export class TryoutComponent {
  // Constants
  CHOICES = CHOICES;

  // Global tryout state
  agreed: Boolean = false;
  started: Boolean = false;
  stopped: Boolean = false;
  ended: Boolean = false;

  question = {
    number: 0,
    text: 'Which of the following BEST describes the term static:',
    subject: 'chem',
    choices: { W: 'Stationary', X: 'Low', Y: 'Constant', Z: 'Used' },
    time: 10.0
  };
  answerChoice = '';

  constructor(private http: Http) { }

  nextQuestion() {
    this.http.post('/api/tryout/next', { }).subscribe(res => {
      if (res.status === 200) {
        this.started = true;
        this.stopped = false;
        this.question = res.json();
        this.answerChoice = '';
      } else if (res.status === 204) {
        this.ended = true;
      }
    });
  }

  skip() {
    this.http.post('/api/tryout/skip', { }).subscribe(() => this.stopped = true);
  }

  submit() {
    this.http.post('/api/tryout/submit', { answer: this.answerChoice }).subscribe(() => this.stopped = true);
  }
}
