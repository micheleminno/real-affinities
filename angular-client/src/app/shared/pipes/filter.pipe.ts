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

    return profiles.filter(p => p.tweets.some(t => t.text.toLowerCase().indexOf(keywords) > -1));
  }
}
