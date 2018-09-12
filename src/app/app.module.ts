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
import { AuthService } from './auth.service';

const appRoutes: Routes = [
  { path: 'admin/tryouts', component: TryoutResultsComponent,
    canActivate: [AuthService], data: { role: 'captain' }},
  { path: 'admin', component: ControlPanelComponent,
    canActivate: [AuthService], data: { role: 'captain' }},
  { path: '', component: IndexComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'question/search', component: QuestionSearchComponent,
    canActivate: [AuthService], data: { role: 'public' }},
  { path: 'question/:id', component: QuestionViewComponent,
    canActivate: [AuthService]},
  { path: 'tryout/:id', component: TryoutComponent,
    canActivate: [AuthService], data: { role: 'student' }},
  { path: 'user/login', component: UserLoginComponent },
  { path: 'user/profile', component: UserProfileComponent,
    canActivate: [AuthService], data: { role: 'public' }},
  { path: 'user/register', component: UserRegisterComponent,
    canActivate: [AuthService], data: { role: 'public' }}
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
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
