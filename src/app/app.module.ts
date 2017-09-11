import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { QuestionEditComponent } from './question/question.edit.component';
import { QuestionListComponent } from './question/question.list.component';

const appRoutes: Routes = [
  { path: 'question/new', component: QuestionEditComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    QuestionEditComponent,
    QuestionListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
