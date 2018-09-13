import { Injectable } from '@angular/core';

@Injectable()
export class Config {
  CHOICES: String[] = ['W', 'X', 'Y', 'Z'];
  SUBJECTS: String[] = ['physics', 'chem', 'ess', 'bio', 'energy', 'math'];
  SUBJECT_DISPLAY = {'physics': 'Physics', 'chem': 'Chemistry', 'ess': 'Earth and Space',
    'bio': 'Biology', 'energy': 'Energy', 'math': 'Mathematics'};
  TYPE_DISPLAY = {MultipleChoiceQuestion: 'Multiple Choice', ShortAnswerQuestion: 'Short Answer'};
}
