import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { IndexComponent } from './content/index.component';
import { QuestionViewComponent } from './question/question.view.component';
import { ResourcesComponent } from './content/resources.component';
import { TryoutComponent } from './tryout/tryout.component';
import { TryoutResultsComponent } from './admin/tryout.results.component';
import { ControlPanelComponent } from './admin/control.panel.component';
import { UserLoginComponent } from './user/user.login.component';
import { UserProfileComponent } from './user/user.profile.component';
import { UserRegisterComponent } from './user/user.register.component';
import { RoundListComponent } from './round/round.list.component';

import { Config } from './config.service';
import { AuthService } from './auth.service';
import {RoundViewComponent} from "./round/round.view.component";
import {TruncatePipe} from "./utils/truncate.pipe";
import {YesNoPipe} from "./utils/yesno.pipe";

const appRoutes: Routes = [
  { path: 'admin/tryouts', component: TryoutResultsComponent,
    canActivate: [AuthService], data: { role: 'captain' } },
  { path: 'admin', component: ControlPanelComponent,
    canActivate: [AuthService], data: { role: 'captain' } },
  { path: '', component: IndexComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'round/:id', component: RoundViewComponent,
    canActivate: [AuthService], data: { role: 'student' } },
  { path: 'question/:id', component: QuestionViewComponent,
    canActivate: [AuthService]},
  { path: 'tryout/:id', component: TryoutComponent,
    canActivate: [AuthService], data: { role: 'student' } },
  { path: 'user/login', component: UserLoginComponent },
  { path: 'user/profile', component: UserProfileComponent,
    canActivate: [AuthService], data: { role: 'public' } },
  { path: 'user/register', component: UserRegisterComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ControlPanelComponent,
    IndexComponent,
    QuestionViewComponent,
    TryoutComponent,
    TryoutResultsComponent,
    UserLoginComponent,
    UserProfileComponent,
    UserRegisterComponent,
    ResourcesComponent,
    RoundViewComponent,
    RoundListComponent,
    TruncatePipe,
    YesNoPipe
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
