import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Profile, Interest } from '../shared/models';
import { ProfilesService, InterestsService, TwitterService, TargetService } from '../shared/services';


@Component({
  selector: 'profiles-page',
  templateUrl: './profiles.component.html'
})
export class ProfilesComponent implements OnInit {

  profileList: Profile[] = [];
  profile: Profile = new Profile('0', []);
  interests: Interest[] = [];
  interest: Interest = new Interest('0', '');

  status: Status = new Status();
  rowsAmount: number;
  loading: boolean;
  addPotentialAccountActive: boolean;

  insertedPotentialAccount: string;
  potentialAccount: string;

  searchKeywords: string;

  insertedFilterKeywords: string;
  filterKeywords: string;

  searchByInterestForm: FormGroup;

  constructor(
    private router: Router,
    private profilesService: ProfilesService,
    private interestsService: InterestsService,
    private targetService: TargetService,
    private twitterService: TwitterService,
    private fb: FormBuilder
  ) {

    this.searchByInterestForm = this.fb.group({
      selectedInterest: ''
    });
  }

  ngOnInit() {

    console.log('Profiles component initialised');

    this.insertedPotentialAccount = 'i.e. pitchfork';
    this.insertedFilterKeywords = 'i.e. music*';
    this.interestsService.loadInterests()
        .subscribe(
        interests => {
          console.log("Retrieved " + interests.length + " interests");
          console.log(interests);

          this.interests = [... this.interests.concat(interests)];
    });

    this.showTarget();
  }

  showTarget() {

    this.loading = true;
    this.status.active = ModeLabels.TARGET_SEARCH;

    this.targetService
      .getTarget()
      .subscribe(
      targetUserIds => {

        console.log("Retrieved " + targetUserIds.length + " target profile ids");

        if (targetUserIds.length == 0) {

          this.profileList = [];
          this.loading = false;

        } else {

          this.profilesService
            .loadProfiles(targetUserIds)
            .subscribe(
            targetProfiles => {

              console.log("Loaded " + targetProfiles.length + " profiles");
              console.log(targetProfiles);

              for (var targetIndex in targetProfiles) {

                targetProfiles[targetIndex]["inTarget"] = true;
              }

              this.twitterService
                .getProfilesWithLatestTweets(targetProfiles)
                .subscribe(
                filledProfiles => {

                  console.log("Loaded latests tweets of " + filledProfiles.length + " profiles");

                  this.updateProfileList(filledProfiles);

                  this.loading = false;

                  var requests = 0;

                  filledProfiles.forEach((profile, index) => {

                    requests++;
                    this.profilesService
                      .index(profile)
                      .subscribe(
                      users => {

                        requests--;
                        if (requests == 0) {

                          console.log("All profiles indexed");
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

    this.loading = true;

    console.log("Search profiles by keywords '" + searchKeywords + "'");

    this.status.active = ModeLabels.KEYWORDS_SEARCH;

    var actualItems = this.status.keywordsSearchResult.items;
    var actualPages = actualItems / 20;
    var nextPage = actualPages + 1;

    this.twitterService
      .searchUsers(searchKeywords, nextPage).subscribe(
      profiles => {

        //this.onToggle.emit(false);

        console.log("Found " + profiles.length + " profiles");

        this.status.keywordsSearchResult.items = actualItems
          + profiles.length;

        var requests = 0;

        for (var profileIndex in profiles) {

          requests++;
          this.targetService
            .isInTarget(profiles[profileIndex]["id"])
            .subscribe(
            inTarget => {

              if(inTarget) {
                console.log("Profile " + profiles[profileIndex]["screen_name"] + " is in target");
              } else {
                console.log("Profile " + profiles[profileIndex]["screen_name"] + " isn't in target");
              }

              requests--;
              profiles[profileIndex]["origin"] = "keywordsSearchResult";
              profiles[profileIndex]["inTarget"] = inTarget;

              if (requests == 0) {

                this.twitterService
                  .getProfilesWithLatestTweets(profiles).subscribe(
                  filledProfiles => {

                    console.log("Loaded " + filledProfiles.length + " profiles with latest tweets");
                    console.log(filledProfiles);

                    this.updateProfileList(filledProfiles);
                  });
                }
              }
            )
        }
      },

      err => {
        this.loading = false;
      }
    );
  }

  updateProfileList(profiles: Profile[]) {

    var profilesToAdd = [];

    console.log("Updating profile list. New profiles:");
    console.log(profiles);

    for (var profilesIndex in this.profileList) {

      this.profileList[profilesIndex]["status"] = "old";
    }

    for (var newProfilesIndex in profiles) {

      var found = false;

      for (var profilesIndex in this.profileList) {

        if (this.profileList[profilesIndex]["id"] == profiles[newProfilesIndex]["id"]) {

          found = true;
          var newInterests = profiles[newProfilesIndex]["interests"];
          if (newInterests) {

            for (var interestIndex in newInterests) {

              if (this.profileList[profilesIndex]["interests"]
                .indexOf(newInterests[interestIndex]) == -1) {

                this.profileList[profilesIndex]["interests"]
                  .push(newInterests[interestIndex]);

                console.log("Interest " + newInterests[interestIndex]["name"] + " added to profile " +
                                this.profileList[profilesIndex]["screen_name"]);
              }
            }
          }

          break;
        }
      }
      if (!found) {

        profiles[newProfilesIndex]["status"] = "new";

        var actualImageUrl = profiles[newProfilesIndex]["profile_image_url"];
        var profileId = profiles[newProfilesIndex]["id"];

        if(actualImageUrl) {

          this.profilesService.updateProfileImg(profileId, actualImageUrl);
        }

        profilesToAdd.push(profiles[newProfilesIndex]);
        console.log("New profile " + profiles[newProfilesIndex]["screen_name"])
      }
    }

    this.profileList = [... this.profileList.concat(profilesToAdd)];
    console.log("New profile list:");
    console.log(this.profileList);

    this.rowsAmount += Math.ceil(profilesToAdd.length / 4);

    this.loading = false;
  }

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

            this.loading = false;

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

                    console.log("Interest '" + interest.name + "' added to profile '" + profile.screen_name + "'");
                  }
                });
            });
        });
    }
  };

  getProfilesMatching() {

    this.loading = true;

    let selectedInterest: Interest = this.searchByInterestForm.value;
    console.log("Form value: " + JSON.stringify(this.searchByInterestForm.value));
    console.log("Selected interest: " + JSON.stringify(selectedInterest));

    this.profilesService
        .getProfilesMatching(selectedInterest)
          .subscribe(
            profiles => {

              if (profiles.length == 0) {

                this.loading = false;

              } else {

                this.twitterService
                    .getProfilesWithLatestTweets(
                        profiles).subscribe(
                        profilesWithTweets => {

                          this.loading = false;

                          for (let profile of profilesWithTweets) {

                            profile["origin"] = "interestMatching";
                            profile["interests"] = [ selectedInterest ];
                          }

                          this.updateProfileList(profilesWithTweets);

                          profilesWithTweets
                              .forEach(
                                  profile => {

                                this.profilesService.index(profile);
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


                this.updateProfileList(profiles);
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

    this.loading = true;

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

              this.updateProfileList([userProfile]);

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
