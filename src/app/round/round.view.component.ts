import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'sb-round-view',
  templateUrl: './round.view.component.html'
})
export class RoundViewComponent implements OnInit {
  questions: any;
  roundId = null;
  constructor (private route: ActivatedRoute, public http: HttpClient) { }
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.roundId = params['id'];
      if (this.roundId) this.http.get(`/api/rounds/${this.roundId}`).subscribe(round => {
        this.questions = round['questions'];
      })
    });
  }
}
