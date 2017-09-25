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

  interest: Interest = new Interest('', '');
  languages: Language[];
  tweetAmounts: TweetAmount[];
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
      interestName: '',
      interestQuery: ''
    });
    // Optional: subscribe to changes on the form
    // this.interestsForm.valueChanges.subscribe(values => this.updateInterest(values));
  }

  insertedInterestQuery: string;


  ngOnInit() {

    var exampleInterest = new Interest('live music', 'i.e. playing live OR concert OR street music');
    this.newInterestForm.patchValue(exampleInterest);

    this.insertedInterestQuery = 'i.e. playing live OR concert OR street music';

    var englishLanguage = new Language('en', 'english');
    var italianLanguage = new Language('it', 'italian');
    this.languages = [englishLanguage, italianLanguage];

    var firstAmount = new TweetAmount(1000, '1K tweets');
    var secondAmount = new TweetAmount(10000, '10K tweets');
    var thirdAmount = new TweetAmount(100000, '100K tweets');
    var fourthAmount = new TweetAmount(1000000, '1M tweets');

    this.tweetAmounts = [firstAmount, secondAmount, thirdAmount, fourthAmount];
  }

  submitForm() {

    this.isSubmitting = true;
    this.createNewInterest(this.newInterestForm.value);

    this.interestsService
      .add(this.interest)
      .subscribe(
      updatedInterest => this.router.navigateByUrl('/interests/'),
      err => {
        this.errors = err;
        this.isSubmitting = false;
      }
      );
  }

  createNewInterest(values: Object) {

    (<any>Object).assign(this.interest, values);
  }

  addInterest() {

    this.interestsService.add(this.interest);
  }

  collectInterest(query, languageLabel, amount) {

    this.isSubmitting = true;

    this.twitterService.searchTweets(query, languageLabel,
      amount)
      .map(data => {

        var interestText = data.value;
        //TODO this.interestsService.update(this.interest.name, interestText);
      })
  }

  goToProfilesPage() {

    this.router.navigateByUrl('');
  }
}
