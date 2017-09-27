import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {

  transform(array: Array<any>, field: string): Array<any> {

        if (typeof field === "undefined") {
            return array;
        }

        array.sort((a: any, b: any) => {
            let left = Number(new Date(a[field]));
            let right = Number(new Date(b[field]));
            return  right - left;
        });
        return array;
    }

}
