import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { IndexComponent } from './content/index.component';
import { QuestionListComponent } from './question/question.list.component';
import { QuestionSearchComponent } from './question/question.search.component';
import { QuestionViewComponent } from './question/question.view.component';
import { ResourcesComponent } from './content/resources.component';
import { TryoutComponent } from './tryout/tryout.component';
import { TryoutResultsComponent } from './admin/tryout.results.component';
import { ControlPanelComponent } from './admin/control.panel.component';
import { UserLoginComponent } from './user/user.login.component';
import { UserProfileComponent } from './user/user.profile.component';
import { UserRegisterComponent } from './user/user.register.component';

import { Config } from './config.service';
import { StatusService } from './status.service';

const appRoutes: Routes = [
  { path: 'admin/tryouts', component: TryoutResultsComponent },
  { path: 'admin', component: ControlPanelComponent },
  { path: '', component: IndexComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'question/search', component: QuestionSearchComponent },
  { path: 'question/:id', component: QuestionViewComponent },
  { path: 'tryout', component: TryoutComponent },
  { path: 'user/login', component: UserLoginComponent },
  { path: 'user/profile', component: UserProfileComponent },
  { path: 'user/register', component: UserRegisterComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ControlPanelComponent,
    IndexComponent,
    QuestionListComponent,
    QuestionSearchComponent,
    QuestionViewComponent,
    TryoutComponent,
    TryoutResultsComponent,
    UserLoginComponent,
    UserProfileComponent,
    UserRegisterComponent,
    ResourcesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    Config,
    StatusService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
