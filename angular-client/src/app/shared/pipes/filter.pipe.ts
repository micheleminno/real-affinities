import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any, input: string) {

    /*

    transform(items: any[], filter: string): any {
    
    if (!items || !filter) {
        return items;
    }

    return items.filter(item => item.description.includes(filter));
    */

      if (input) {
          input = input.toLowerCase();
          return value.filter(function (el: any) {
              return el.toLowerCase().indexOf(input) > -1;
          })
      }
      return value;
  }
}
