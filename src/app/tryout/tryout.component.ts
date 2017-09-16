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

  // Whether the user has agreed to the conditions
  agreed: Boolean = false;
  // Whether the tryout has started
  started: Boolean = false;
  // Whether the currentTime question has stopped (either time expired or it was skipped)
  stopped: Boolean = false;
  // Whether the tryout has ended
  ended: Boolean = false;

  // Current question
  question: any;
  // Current answer choice (updated in form)
  answerChoice: String = '';

  currentTime: number;

  constructor(private http: Http) { }

  ngAfterViewInit() {
    // Setup timer to continuously update question time
    window.onload = () => this.startTimer();
    if (document.readyState === 'complete') {
      this.startTimer();
    }
  }

  startTimer() {
    window.setInterval(this.tick, 200);
  }

  tick() {
    this.currentTime = Date.now();

    // Stop the question if time has expired
    if (this.started && !this.ended && !this.stopped) {
      if (this.currentTime >= this.question.released + this.question.time * 1000) {
        this.stopped = true;
      }
    }
  }

  nextQuestion() {
    this.http.post('/api/tryout/next', { }).subscribe(res => {
      if (res.status === 200) {
        // Reset question
        this.started = true;
        this.stopped = false;
        this.answerChoice = '';

        // Populate question
        this.question = res.json();
        this.currentTime = Date.now();
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
