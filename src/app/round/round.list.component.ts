import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-round-list',
  templateUrl: './round.list.component.html'
})
export class RoundListComponent {
  @Input()
  rounds: any[];
}
