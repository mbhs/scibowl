import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { QuestionListComponent } from './question/question.list.component';
import { QuestionSearchComponent } from './question/question.search.component';
import { QuestionViewComponent } from './question/question.view.component';
import { TryoutComponent } from './tryout/tryout.component';

const appRoutes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'question/search', component: QuestionSearchComponent },
  { path: 'question/:id', component: QuestionViewComponent },
  { path: 'tryout', component: TryoutComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    QuestionListComponent,
    QuestionSearchComponent,
    QuestionViewComponent,
    TryoutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
