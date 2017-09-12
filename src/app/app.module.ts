import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { QuestionViewComponent } from './question/question.view.component';
import { QuestionListComponent } from './question/question.list.component';

const appRoutes: Routes = [
  { path: 'question/:id', component: QuestionViewComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    QuestionViewComponent,
    QuestionListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
