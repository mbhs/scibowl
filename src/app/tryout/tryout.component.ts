import { Component } from '@angular/core';
import { Observable } from 'rxjs/Rx';

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

  question = {
    number: 0,
    text: 'Which of the following BEST describes the term static:',
    subject: 'chem',
    choices: { W: 'Stationary', X: 'Low', Y: 'Constant', Z: 'Used' },
    time: 10.0
  };
  answerChoice = '';

  nextQuestion() {
    this.started = true;
    this.stopped = false;
    this.question.number += 1;
    this.answerChoice = '';
  }
}
