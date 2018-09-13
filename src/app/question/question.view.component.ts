import {Component, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Config } from '../config.service';

@Component({
  selector: 'sb-question-view',
  templateUrl: './question.view.component.html'
})
export class QuestionViewComponent implements OnInit {
  @Input()
  questionId = null;
  @Input()
  fullEditor = true;
  @Input()
  editing = false;

  questionForm: FormGroup;
  newQuestion: Boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private http: HttpClient,
              public config: Config) {
    const controls = {
      text: ['', Validators.required],
      subject: ['', Validators.required],
      kind: [''],
      choiceAnswer: [''],
      shortAnswer: ['']
    };

    for (const choice of config.CHOICES) {
      controls['choice' + choice] = [''];
    }

    this.questionForm = fb.group(controls);
  }

  ngOnInit() {
    // Promises can be difficult to work with!
    this.route.params.subscribe(params => {
      if (this.fullEditor) this.questionId = params['id'];

      if (this.questionId === 'new') {
        this.editing = true;
        this.newQuestion = true;
      } else {
        this.http.get(`/api/questions/${this.questionId}`).subscribe(res => {
          this.questionForm.controls.text.setValue(res['text']);
          this.questionForm.controls.subject.setValue(res['subject']);
          this.questionForm.controls.kind.setValue(res['kind']);
          if (res['kind'] === 'MultipleChoiceQuestion') {
            this.questionForm.controls.choiceAnswer.setValue(res['answer']);
            for (const choice of res['choices']) {
              this.questionForm.controls['choice' + choice.choice].setValue(choice.text);
            }
          } else {
            this.questionForm.controls.shortAnswer.setValue(res['answer']);
          }
        });
      }
    });
  }

  submit() {
    const data = {
      text: this.questionForm.controls['text'].value,
      subject: this.questionForm.controls['subject'].value,
      kind: this.questionForm.controls['kind'].value
    };

    if (this.questionForm.controls['kind'].value === 'MultipleChoice') {
      data['choices'] = [];
      for (const choice of this.config.CHOICES) {
        data['choices'].push({ choice: choice, text: this.questionForm.controls['choice' + choice].value });
      }
      data['answer'] = this.questionForm.controls['choiceAnswer'].value;
    } else {
      data['answer'] = this.questionForm.controls['shortAnswer'].value;
    }

    if (this.newQuestion) {
      this.http.post('/api/questions/new', data).subscribe(res => {
        if (this.fullEditor) this.router.navigateByUrl(`/question/${res['id']}`);
      });
    } else {
      this.http.post(`/api/questions/${this.questionId}`, data).subscribe(() => this.editing = false);
    }
  }
}
