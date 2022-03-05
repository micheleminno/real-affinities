import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(profiles: any[], keywords: string) {

    if (!profiles || !keywords) {
        return profiles;
    }

    keywords = keywords.toLowerCase();

    return profiles.filter(function (p: any) {
        return p.tweets.find(t => t.toLowerCase().indexOf(keywords) > -1);
    });
  }
}
