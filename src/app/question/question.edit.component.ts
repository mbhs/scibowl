import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'question-edit',
  templateUrl: './question.edit.component.html'
})
export class QuestionEditComponent {
  questionForm: FormGroup;
  CHOICES = ['W', 'X', 'Y', 'Z'];
  SUBJECTS = ['physics', 'chem', 'ess', 'bio', 'energy', 'math'];
  DEFAULT_CHOICES = {W: 'Mitochondrion', X: 'Endoplasmic reticulum', Y: 'Nucleus', Z: 'Golgi apparatus'};

  constructor(private fb: FormBuilder) {
    const controls = {
      text: ['', Validators.required],
      subject: ['', Validators.required],
      kind: ['MultipleChoice'],
      choiceAnswer: [''],
      shortAnswer: ['']
    };

    for (const choice of this.CHOICES) {
      controls['choice' + choice] = [''];
    }

    this.questionForm = fb.group(controls);
  }
}
