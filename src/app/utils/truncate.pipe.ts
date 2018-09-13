/* Adapted from https://stackoverflow.com/questions/44669340/how-to-truncate-text-in-angular2 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(str: string, charLimit = 25, completeWords = false, ellipsis = '...') {
    if (completeWords) {
      charLimit = str.substr(0, charLimit).lastIndexOf(' ');
    }
    return str.substr(0, charLimit) + ((str.length > charLimit) ? ellipsis : "");
  }
}
