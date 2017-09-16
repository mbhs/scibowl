import { Component, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { CHOICES } from '../game';


@Component({
  selector: 'sb-tryout',
  templateUrl: './tryout.component.html'
})
export class TryoutComponent implements AfterViewInit {
  // Constants
  CHOICES = CHOICES;

  // Global tryout state
  agreed: Boolean = false;
  started: Boolean = false;
  stopped: Boolean = false;
  ended: Boolean = false;

  question: any;
  answerChoice: String = '';

  current: number;

  constructor(private http: Http) { }

  ngAfterViewInit() {
    window.onload = () => this.startTimer();

    if (document.readyState === 'complete') {
      this.startTimer();
    }
  }

  startTimer() {
    window.setInterval(this.tick, 200);
  }

  tick() {
    this.current = Date.now();

    if (this.started && !this.ended && !this.stopped) {
      if (this.current >= this.question.time + this.question.released) {
        this.stopped = true;
      }
    }
  }

  nextQuestion() {
    this.http.post('/api/tryout/next', { }).subscribe(res => {
      if (res.status === 200) {
        this.started = true;
        this.stopped = false;
        this.question = res.json();
        this.answerChoice = '';
        this.current = Date.now();
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
