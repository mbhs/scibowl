import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-question-list',
  templateUrl: './question.list.component.html'
})
export class QuestionListComponent {
  @Input()
  questions: any[];
}
