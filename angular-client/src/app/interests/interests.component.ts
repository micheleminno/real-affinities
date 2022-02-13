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
  languages: Language[] = [];
  tweetAmounts: TweetAmount[] = [];
  newInterestForm: FormGroup;
  errors: Object = {};
  isSubmitting = false;


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

    var exampleInterest = new Interest('live music', 'i.e. playing live OR concert OR street music');
    this.newInterestForm.patchValue(exampleInterest);

    this.insertedInterestName = 'interest name';
    this.insertedInterestQuery = 'interest query';

    var englishLanguage = new Language('en', 'english');
    var italianLanguage = new Language('it', 'italian');
    this.languages = [englishLanguage, italianLanguage];

    var firstAmount = new TweetAmount(1000, '1K tweets');
    var secondAmount = new TweetAmount(10000, '10K tweets');
    var thirdAmount = new TweetAmount(100000, '100K tweets');
    var fourthAmount = new TweetAmount(1000000, '1M tweets');

    this.tweetAmounts = [firstAmount, secondAmount, thirdAmount, fourthAmount];

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

    //TODO: this.interestActive = true
    this.isSubmitting = true;

    this.createNewInterest(this.newInterestForm.value);

    this.interestsService
      .add(this.interest)
      .subscribe(
      updatedInterest => {
        if(updatedInterest) {
            this.interestList.push(this.interest);
        }
      },
      err => {
        this.errors = err;
        this.isSubmitting = false;
      }
      );
  }

  createNewInterest(values: Object) {

    (<any>Object).assign(this.interest, values);
  }

  collectInterest(query, languageLabel, amount) {

    this.isSubmitting = true;

    this.twitterService.searchTweets(query, languageLabel,
      amount)
      .map(data => {

        var interestText = data.value;
        this.interestsService.update(this.interest.name, interestText);
      })
  }

  goToProfilesPage() {

    this.router.navigateByUrl('');
  }
}
