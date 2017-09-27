import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'range' })
export class RangePipe implements PipeTransform {

  transform(input: number[], total: number) {

    for ( var i = 0; i < total; i++)
      input.push(i);
    return input;
  };

}
