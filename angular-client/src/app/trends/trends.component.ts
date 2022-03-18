import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Trend } from '../shared/models';
import { TrendsService } from '../shared/services';

@Component({
  selector: 'trends-page',
  templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {

  trendList: Trend[] = [];
  trend: Trend = new Trend('', '');
  newTrendForm: FormGroup;
  errors: Object = {};
  loading = false;


  constructor(
    private router: Router,
    private trendsService: TrendsService,
    private fb: FormBuilder
  ) {

    this.newTrendForm = this.fb.group({
      label: '',
      query: ''
    });
    // Optional: subscribe to changes on the form
    // this.trendsForm.valueChanges.subscribe(values => this.updateTrend(values));
  }

  insertedTrendQuery: string;
  insertedTrendName: string;


  ngOnInit() {

    console.log('Trends component initialised');

    var exampleTrend = new Trend('Ethereum', 'ETH');
    this.newTrendForm.patchValue(exampleTrend);

    this.insertedTrendName = 'trend label';
    this.insertedTrendQuery = 'trend query';

    this.showTrends();
  }

  showTrends() {

    this.trendsService
      .loadTrends()
      .subscribe(
      trends => {

        console.log("Retrieved " + trends.length + " trends");
        console.log(trends);

        this.trendList = [... this.trendList.concat(trends)];

      });
  }

  addTrend() {

    this.loading = true;

    this.createNewTrend(this.newTrendForm.value);

    this.trendsService
      .add(this.trend)
      .subscribe(
      updatedTrend => {
        if(updatedTrend) {
            this.trendList.push(this.trend);
        }

        this.loading = false;
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  deleteTrend(trend: Trend) {

    this.loading = true;

    this.trendsService
      .remove(trend.label)
      .subscribe(
      removedTrend => {
        if(removedTrend) {
            this.trendList = this.trendList.filter(t => t !== trend);
        }

        this.loading = false;
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  deleteTrends() {

    this.loading = true;

    this.trendsService
      .removeAllTrends()
      .subscribe(
      removed => {
        if(removed) {
            this.trendList = [];
        }

        this.loading = false;
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  editTrend(name: string, content: string) {

    this.loading = true;

    content = this.polishString(content);

    console.log("Edited content: " + content);

    this.trendsService
      .update(name, encodeURI(content))
      .subscribe(
      updatedTrend => {
        if(updatedTrend) {
            this.loading = false;
        }
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  polishString = function(rawString: string) {

    /*
    * - clear carriage return => space
    * - replace multiple spaces by a single one
    * - clear leading and trailing spaces (same as jQuery trim())
    */
    return rawString.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g,' ').replace(/^\s+|\s+$/,'')
  }

  createNewTrend(values: Object) {

    (<any>Object).assign(this.trend, values);
  }

  collectTrend(name, query, languageLabel, amount) {

    /*
    this.loading = true;

    console.log("Searching for recent tweets");

    this.twitterService.searchTweets(encodeURI(query), languageLabel,
      amount)
      .subscribe(trendText => {

        console.log("Updating trend " + name);
        console.log("New text: \n" + trendText);

        this.trendsService.update(name, trendText)
          .subscribe(
          updated => {

            if(updated) {
              console.log("Trend " + query + " updated in ES");
            }

            const updatedTrendIndex = this.trendList.findIndex((i => i.name ===  name));
            this.trendList[updatedTrendIndex].content = trendText;

            this.loading = false;
          }
        );
      })
      */
  }

  goToProfilesPage() {

    this.router.navigateByUrl('');
  }

  goToTrendsPage() {

    this.router.navigateByUrl('/trends');
  };
}
