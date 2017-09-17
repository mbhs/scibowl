import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { IndexComponent } from './content/index.component';
import { QuestionListComponent } from './question/question.list.component';
import { QuestionSearchComponent } from './question/question.search.component';
import { QuestionViewComponent } from './question/question.view.component';
import { TryoutComponent } from './tryout/tryout.component';
import { UserLoginComponent } from './user/user.login.component';
import { UserRegisterComponent } from './user/user.register.component';
import { ResourcesComponent } from './content/resources.component';

import { StatusService } from './status.service';

const appRoutes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'question/search', component: QuestionSearchComponent },
  { path: 'question/:id', component: QuestionViewComponent },
  { path: 'tryout', component: TryoutComponent },
  { path: 'user/login', component: UserLoginComponent },
  { path: 'user/register', component: UserRegisterComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    QuestionListComponent,
    QuestionSearchComponent,
    QuestionViewComponent,
    TryoutComponent,
    UserLoginComponent,
    UserRegisterComponent,
    ResourcesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    StatusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
