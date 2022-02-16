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

  deleteInterest(interest: Interest) {

    //TODO: this.interestActive = true
    console.log('deleteInterest() called');
    this.isSubmitting = true;

    this.interestsService
      .remove(interest.name)
      .subscribe(
      removedInterest => {
        if(removedInterest) {
            this.interestList = this.interestList.filter(i => i !== interest);
        }
      },
      err => {
        this.errors = err;
        this.isSubmitting = false;
      }
      );
  }

  editInterest(name: string, content: string) {

    //TODO: this.interestActive = true

    this.isSubmitting = true;

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
        this.isSubmitting = false;
      }
      );
  }

  createNewInterest(values: Object) {

    (<any>Object).assign(this.interest, values);
  }

  collectInterest(query, languageLabel, amount) {

    this.isSubmitting = true;

    this.twitterService.searchTweets(encodeURI(query), languageLabel,
      amount)
      .map(interestText => {

        this.interestsService.update(this.interest.name, interestText);
      })
  }

  goToProfilesPage() {

    this.router.navigateByUrl('');
  }
}
