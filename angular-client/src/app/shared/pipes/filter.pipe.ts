import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(profile: any, input: string) {

    console.log("Inside pipe:");
    console.log(profile);
    console.log("input: " + input);

    /*

    transform(items: any[], filter: string): any {

    if (!items || !filter) {
        return items;
    }

    return items.filter(item => item.description.includes(filter));
    */

      if (input) {
          input = input.toLowerCase();
          return profile.filter(function (el: any) {
              return el.toLowerCase().indexOf(input) > -1;
          })
      }
      
      return profile;
  }
}
