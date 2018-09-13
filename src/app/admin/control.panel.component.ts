import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../auth.service";

@Component({
  selector: 'sb-admin-control-panel',
  templateUrl: './control.panel.component.html'
})
export class ControlPanelComponent {
  joinCode = "loading...";

  constructor (private http: HttpClient, public auth: AuthService) {
    this.http.get(`/api/teams/${this.auth.team['_id']}/code`).subscribe(res => this.joinCode = res['code']);
  }

  newCode() {
    this.http.post(`/api/teams/${this.auth.team['_id']}/code`, { }).subscribe(res => this.joinCode = res['code']);
  }
}
