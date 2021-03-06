import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Profile, Interest } from '../shared/models';
import { ProfilesService, TwitterService, TargetService } from '../shared/services';


@Component({
  selector: 'profiles-page',
  templateUrl: './profiles.component.html'
})
export class ProfilesComponent implements OnInit {

  constructor(
    private router: Router,
    private profilesService: ProfilesService,
    private targetService: TargetService,
    private twitterService: TwitterService
  ) { }

  profileList: Profile[] = [];
  profile: Profile = new Profile('0', []);
  interests: Interest[] = [];
  status: Status = new Status();
  rowsAmount: number;
  loading: boolean;
  addPotentialAccountActive: boolean;

  insertedPotentialAccount: string;
  potentialAccount: string;

  searchKeywords: string;

  insertedFilterKeywords: string;
  filterKeywords: string;

  ngOnInit() {

    this.insertedPotentialAccount = 'i.e. pitchfork';
    this.insertedFilterKeywords = 'i.e. music*';
    this.showTarget();
  }

  showTarget() {

    this.loading = true;
    this.status.active = ModeLabels.TARGET_SEARCH;

    this.targetService
      .getTarget()
      .subscribe(
      targetUserIds => {

        if (targetUserIds.length == 0) {

          this.profileList = [];
          this.loading = false;

        } else {

          this.profilesService
            .loadProfiles(targetUserIds)
            .subscribe(
            targetUsers => {

              for (var targetIndex in targetUsers) {

                targetUsers[targetIndex]["inTarget"] = true;
              }

              this.twitterService
                .getProfilesWithLatestTweets(targetUsers)
                .subscribe(
                users => {

                  this.profilesService
                    .updateProfileList(users);

                  this.loading = false;

                  var requests = 0;

                  users.forEach((user, index) => {

                    requests++;
                    this.profilesService
                      .index(user)
                      .subscribe(
                      users => {

                        requests--;
                        if (requests == 0) {

                          this.assignInterests(users);
                        }
                      });
                  });
                });
            });
        }
      });
  };

  search(searchKeywords: string) {

    //this.isSubmitting = true;

    this.status.active = ModeLabels.KEYWORDS_SEARCH;

    var actualItems = this.status.keywordsSearchResult.items;
    var actualPages = actualItems / 20;
    var nextPage = actualPages + 1;

    this.twitterService
      .searchUsers(searchKeywords, nextPage).subscribe(
      profiles => {

        //this.isSubmitting = false;
        //this.onToggle.emit(false);

        this.status.keywordsSearchResult.items = actualItems
          + profiles.length;

        var requests = 0;

        for (var profileIndex in profiles) {

          requests++;
          this.targetService
            .isInTarget(profiles[profileIndex]["id"])
            .subscribe(
            inTarget => {

              requests--;
              profiles[profileIndex]["origin"] = "keywordsSearchResult";
              profiles[profileIndex]["inTarget"] = inTarget;

              if (requests == 0) {

                this.twitterService
                  .getProfilesWithLatestTweets(profiles).subscribe(
                  filledProfiles => {

                    this.profilesService
                      .updateProfileList(filledProfiles)
                      .subscribe(
                      data => {

                        //this.isSubmitting = false;
                        //this.onToggle.emit(true);
                      },
                      err => err //this.isSubmitting = false
                      );
                  });
              }
            }
            )
        }
      },

      err => err //this.isSubmitting = false
      );
  }

  canShowProfile(index, parentIndex) {

    var inCurrentRow = (index) / 4 < parentIndex + 1
      && (index) / 4 >= parentIndex;

    return inCurrentRow;
  };

  updateTarget(profile: Profile) {

    this.loading = true;

    // in order to restart from beginning to compute
    // interesting profiles
    this.status.algorithmSearchResult.items = 0;

    if (profile["inTarget"]) {

      this.targetService.removeFromTarget(profile.id)
        .subscribe(removed => {

          if (removed) {
            profile["inTarget"] = false;
          }

          this.loading = false;
        });
    } else {

      this.targetService.addToTarget(profile.id)
        .subscribe(added => {

          if (added) {

            profile["inTarget"] = true;

            //loading = false;

            return this.profilesService.index(profile);
          }
        });
    }

  };

  style(profile: Profile): Object {

    var style = { border: '' };

    if (this.profile.inTarget) {

      style["background-color"] = "#F0DADA";
    } else if (profile.origin == "keywordsSearchResult") {

      style["background-color"] = "#BFF2D5";
    } else if (profile.origin == "interestMatching") {

      style["background-color"] = "#81DAF5";
    } else if (profile.origin == "screenNameSearchResult") {

      style["background-color"] = "#ADC1F7";
    }

    if (profile.status == "new") {

      style.border = "4px solid rgb(56,117,196)";
    } else {

      style.border = "2px solid black";
    }

    return style;
  };

  assignInterests(profiles: Profile[]) {

    for (let profileIndex in profiles) {

      profiles[profileIndex].interests = [];
    }

    if (this.interests.length == 0) {

      this.loading = false;

    } else {

      var requests = 0;

      this.interests
        .forEach((interest, index) => {

          requests++;

          this.profilesService
            .getProfilesMatching(
            interest)
            .subscribe(matchingProfiles => {

              requests--;
              if (requests == 0) {

                this.loading = false;
              }

              var matchingProfilesIds = [];
              for (let matchingProfile of matchingProfiles) {

                matchingProfilesIds
                  .push(parseInt(matchingProfile.id));
              }

              profiles
                .forEach(function(
                  profile) {

                  if (matchingProfilesIds
                    .indexOf(profile.id) > -1) {

                    profile.interests
                      .push(interest);
                  }
                });
            });
        });
    }
  };

  getProfilesMatching(interest) {

    this.loading = true;

    this.profilesService
        .getProfilesMatching(
            interest.name)
        .subscribe(
            profiles => {

              if (profiles.length == 0) {

                this.loading = false;

              } else {

                this.twitterService
                    .getProfilesWithLatestTweets(
                        profiles).subscribe(
                        users => {

                          for (let profile of profiles) {

                            profile["origin"] = "interestMatching";
                            profile["interests"] = [ interest.name ];
                          }

                          this.profilesService
                              .updateProfileList(users);

                          this.loading = false;

                          users
                              .forEach(
                                  user => {

                                this.profilesService
                                    .index(user);
                              });
                        });

              }
            });
  };

  showInterestingAccounts() {

    this.loading = true;

    this.status.active = ModeLabels.ALGORITHM_SEARCH;

    var actualItems = this.status.algorithmSearchResult.items;

    this.targetService
      .getInterestingUsers(actualItems, 20)
      .subscribe(
      ids => {

        this.twitterService
          .lookupUsers(ids)
          .subscribe(profiles => {

            this.twitterService.getProfilesWithLatestTweets(
              profiles).subscribe(
              profiles => {


                this.profilesService.updateProfileList(profiles);
                this.status.algorithmSearchResult.items = actualItems
                  + profiles.length;

                var requests = 0;

                profiles.forEach(
                  profile => {

                    requests++;

                    this.profilesService
                      .index(
                      profile)
                      .subscribe(data => {

                        requests--;
                        if (requests == 0) {

                          this.assignInterests(profiles);
                        }
                      });
                  });
              });
          });
      });
  };

  addPotentialAccount(potentialAccount) {

    this.status.active = ModeLabels.SCREENNAME_SEARCH;

    // this.loading = true;

    this.twitterService
      .getProfileLatestTweets(potentialAccount, '0')
      .subscribe(
      tweetsInfo => {

        if (tweetsInfo[0].length == 0) {

          this.loading = false;

          alert("No tweets found for user "
            + potentialAccount);

        } else {

          var firstTweet = tweetsInfo[0][0];
          var userProfile = firstTweet["user"];
          userProfile["origin"] = "screenNameSearchResult";

          this.targetService
            .isInTarget(userProfile.id)
            .subscribe(

            inTargetResult => {

              userProfile["inTarget"] = inTargetResult[0];
              userProfile["tweets"] = tweetsInfo[0];

              this.profilesService
                .updateProfileList([userProfile]);

              this.loading = false;

              this.profilesService
                .index(userProfile)
                .subscribe(
                data => {

                  this.assignInterests([userProfile]);
                });
            });
        }
      });
  };

  goToInterestsPage() {

    this.router.navigateByUrl('/interests');
  }
}

const enum ModeLabels {

  TARGET_SEARCH, // 0
  KEYWORDS_SEARCH, // 1
  SCREENNAME_SEARCH, // 2
  INTERESTS_SEARCH,  // 3
  ALGORITHM_SEARCH // 4
}

export class Mode {

  constructor(active?: boolean, items?: number) {

    this.active = active || false;
    this.items = items || 0;
  }

  active: boolean;
  items: number;
}

export class Status {

  constructor(

    active?: ModeLabels,

    targetSearchResult?: Mode,
    keywordsSearchResult?: Mode,
    screennameSearchResult?: Mode,
    interestSearchResult?: Mode,
    algorithmSearchResult?: Mode
  ) {

    this.active = active || undefined;
    this.targetSearchResult = targetSearchResult || new Mode();
    this.keywordsSearchResult = keywordsSearchResult || new Mode();
    this.screennameSearchResult = screennameSearchResult || new Mode();
    this.interestSearchResult = interestSearchResult || new Mode();
    this.algorithmSearchResult = algorithmSearchResult || new Mode();
  }

  active: ModeLabels;
  targetSearchResult: Mode;
  keywordsSearchResult: Mode;
  screennameSearchResult: Mode;
  interestSearchResult: Mode;
  algorithmSearchResult: Mode;
}
