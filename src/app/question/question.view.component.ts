import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { CHOICES, SUBJECTS, SUBJECT_DISPLAY, TYPE_DISPLAY } from '../game';

@Component({
  selector: 'question-view',
  templateUrl: './question.view.component.html'
})
export class QuestionViewComponent implements OnInit {
  DEFAULT_CHOICES = {W: 'Mitochondrion', X: 'Endoplasmic reticulum', Y: 'Nucleus', Z: 'Golgi apparatus'};
  CHOICES = CHOICES;
  SUBJECTS = SUBJECTS;
  SUBJECT_DISPLAY = SUBJECT_DISPLAY;
  TYPE_DISPLAY = TYPE_DISPLAY;

  questionForm: FormGroup;
  editing: Boolean = false;
  new_question: Boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private http: Http) {
    const controls = {
      text: ['', Validators.required],
      subject: ['', Validators.required],
      type: [''],
      choiceAnswer: [''],
      shortAnswer: ['']
    };

    for (const choice of CHOICES) {
      controls['choice' + choice] = [''];
    }

    this.questionForm = fb.group(controls);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];

      if (id === 'new') {
        this.editing = true;
        this.new_question = true;
      } else {
        this.http.get('/api/question/' + id).map(res => res.json()).subscribe(res => {
          this.questionForm.controls.text.setValue(res.text);
          this.questionForm.controls.subject.setValue(res.subject);
          this.questionForm.controls.type.setValue(res.type);
          if (this.questionForm.controls.type.value === 'MultipleChoice') {
            this.questionForm.controls.choiceAnswer.setValue(res.answer);
          } else {
            this.questionForm.controls.shortAnswer.setValue(res.answer);
          }
        });
      }
    });
  }

  submit() {
    const data = {
      text: this.questionForm.controls['text'].value,
      subject: this.questionForm.controls['subject'].value,
      type: this.questionForm.controls['type'].value
    };

    if (this.questionForm.controls['type'].value === 'MultipleChoice') {
      data['choices'] = [];
      for (const choice of CHOICES) {
        data['choices'].push({ choice: choice, text: this.questionForm.controls['choice' + choice].value });
      }
      data['answer'] = this.questionForm.controls['choiceAnswer'].value;
    } else {
      data['answer'] = this.questionForm.controls['shortAnswer'].value;
    }

    if (this.new_question) {
      this.http.post('/api/question/new', data).map(res => res.json()).subscribe(res => {
        this.router.navigateByUrl('/question/' + res['id']);
      });
    } else {
      this.route.params.subscribe(params => {
        this.http.post('/api/question/' + params['id'] + '/edit', data).subscribe(() => this.editing = false);
      });
    }
  }
}
