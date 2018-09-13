import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yesno'
})
export class YesNoPipe implements PipeTransform {
  transform(value: any, no: string, yes: string) {
    if (value) {
      if (yes) return yes;
      else return value;
    }
    return no;
  }
}
