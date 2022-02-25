import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Interest, Language, TweetAmount } from '../shared/models';
import { InterestsService, TwitterService } from '../shared/services';

@Component({
  selector: 'interests-page',
  templateUrl: './interests.component.html'
})
export class InterestsComponent implements OnInit {

  interestList: Interest[] = [];
  interest: Interest = new Interest('', '');
  newInterestForm: FormGroup;
  errors: Object = {};
  loading = false;


  constructor(
    private router: Router,
    private interestsService: InterestsService,
    private twitterService: TwitterService,
    private fb: FormBuilder
  ) {

    this.newInterestForm = this.fb.group({
      name: '',
      query: ''
    });
    // Optional: subscribe to changes on the form
    // this.interestsForm.valueChanges.subscribe(values => this.updateInterest(values));
  }

  insertedInterestQuery: string;
  insertedInterestName: string;


  ngOnInit() {

    console.log('Interests component initialised');

    var exampleInterest = new Interest('live music', 'i.e. playing live OR concert OR street music');
    this.newInterestForm.patchValue(exampleInterest);

    this.insertedInterestName = 'interest name';
    this.insertedInterestQuery = 'interest query';

    this.showInterests();
  }

  showInterests() {

    this.interestsService
      .loadInterests()
      .subscribe(
      interests => {

        console.log("Retrieved " + interests.length + " interests");
        console.log(interests);

        this.interestList = [... this.interestList.concat(interests)];

      });
  }

  addInterest() {

    this.loading = true;

    this.createNewInterest(this.newInterestForm.value);

    this.interestsService
      .add(this.interest)
      .subscribe(
      updatedInterest => {
        if(updatedInterest) {
            this.interestList.push(this.interest);
        }

        this.loading = false;
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  deleteInterest(interest: Interest) {

    this.loading = true;

    this.interestsService
      .remove(interest.name)
      .subscribe(
      removedInterest => {
        if(removedInterest) {
            this.interestList = this.interestList.filter(i => i !== interest);
        }
        
        this.loading = false;
      },
      err => {
        this.errors = err;
        this.loading = false;
      }
      );
  }

  editInterest(name: string, content: string) {

    this.loading = true;

    content = this.polishString(content);

    console.log("Edited content: " + content);

    this.interestsService
      .update(name, encodeURI(content))
      .subscribe(
      updatedInterest => {
        if(updatedInterest) {
            // TODO
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

  createNewInterest(values: Object) {

    (<any>Object).assign(this.interest, values);
  }

  collectInterest(name, query, languageLabel, amount) {

    this.loading = true;

    console.log("Searching for recent tweets");

    this.twitterService.searchTweets(encodeURI(query), languageLabel,
      amount)
      .subscribe(interestText => {

        console.log("Updating interest " + name);
        console.log("New text: \n" + interestText);

        this.interestsService.update(name, interestText)
          .subscribe(
          updated => {

            if(updated) {
              console.log("Interest " + query + " updated in ES");
            }

            const updatedInterestIndex = this.interestList.findIndex((i => i.name ===  name));
            this.interestList[updatedInterestIndex].content = interestText;

            this.loading = false;
          }
        );
      })
  }

  goToProfilesPage() {

    this.router.navigateByUrl('');
  }
}
