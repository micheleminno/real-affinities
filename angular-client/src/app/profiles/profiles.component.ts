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
  profileImages: string[] = [];
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

  sortForm: FormGroup;

  sortingPredicates = [
                        { label : 'Target first', field : 'inTarget' },
                        { label : 'Followers', field : 'followers_count' },
                        { label : 'Following', field : 'friends_count' },
                        { label : 'Tweets', field : 'statuses_count' }
                      ];

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

    this.sortForm = this.fb.group({
      selectedSort: ''
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
                      res => {

                        requests--;
                        if (requests == 0) {

                          console.log("All profiles indexed");
                          this.assignInterests(filledProfiles);
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

          console.log("Asking if " + profileIndex + " profile is in target");
          console.log(profiles[profileIndex]);

          requests++;
          this.targetService
            .isInTarget(profiles[profileIndex]["id"])
            .subscribe(
            res => {

              if(res.isPresent) {
                console.log("Profile " + res.profileId + " is in target");
              } else {
                console.log("Profile " + res.profileId + " isn't in target");
              }

              requests--;

              // get profile with id = res.profile.profileId
              const profile = profiles.find(p => p.id === res.profileId);

              if(profile !== undefined) {

                console.log("Adding origin 'keywords search' to profile " + profile.id);
                profile["origin"] = "keywordsSearchResult";
                profile["inTarget"] = res.isPresent;
              }


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

    console.log("Updating profile list with " + profiles.length + " profiles:");
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

          this.updateProfileImg(profileId, actualImageUrl);
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

  updateProfileImg(profileId: string, normalImageUrl: string) {

    var biggerImageUrl = normalImageUrl.substring(0, normalImageUrl.lastIndexOf("normal"));
    biggerImageUrl = biggerImageUrl + "400x400";
    var resultUrl = biggerImageUrl + ".jpg";

    this.profilesService.urlExists(resultUrl)
      .subscribe(
      (jpgFound: boolean) => {

        if (!jpgFound) {

          resultUrl = biggerImageUrl
            + ".jpeg";

          this.profilesService.urlExists(resultUrl)
            .subscribe(
            (jpegFound: boolean) => {

              if (!jpegFound) {

                resultUrl = biggerImageUrl
                  + ".png";
              }

              this.profileImages[profileId] = resultUrl;

              console.log("Image at " + resultUrl + " added as profile image of profile id " + profileId);
            });
        } else {

          this.profileImages[profileId] = resultUrl;

          console.log("Image at " + resultUrl + " added as profile image of profile id " + profileId);
        }
      });
  };

  updateTarget(profile: Profile) {

    this.loading = true;

    // in order to restart from beginning to compute
    // interesting profiles
    this.status.algorithmSearchResult.items = 0;

    if (profile["inTarget"]) {

      console.log("Removing profile from target:");
      console.log(profile);

      this.targetService.removeFromTarget(profile.id)
        .subscribe(removed => {

          if (removed) {
            console.log("Profile with id " + profile.id + " removed from target");

            profile["inTarget"] = false;
          }

          this.profileList = this.profileList.filter(p => p.id !== profile.id);

          this.loading = false;
        });
    } else {

      console.log("Adding profile to target:");
      console.log(profile);

      this.targetService.addToTarget(profile.id)
        .subscribe(added => {

          if (added) {

            console.log("Profile with id " + profile.id + " added to target");
            profile["inTarget"] = true;

            console.log("Indexing profile " + profile.id);
            this.profilesService.index(profile)
              .subscribe(res => {

                if (res.msg) {

                  console.log("Profile with id " + profile.id + " indexed in ES");
                  this.loading = false;
                }
              });
          }
        });
    }

  };

  style(profile: Profile): Object {

    console.log("Assigning style to profile " + profile.id + " in target: " + profile.inTarget
                + " with origin: " + profile.origin + " and status: " + profile.status);

    var style = { border: '' };

    if (profile.inTarget) {

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

    let selectedInterest: Interest = this.searchByInterestForm.value.selectedInterest;

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

              userProfile["inTarget"] = inTargetResult.isPresent;
              var tweets = tweetsInfo[0];

              // Remove user from each tweet
              tweets = tweets.map(tweet => {

                const requiredFields = ["text", "created_at"];

                const minimalTweet = requiredFields.reduce((obj, key) => {

                                        obj[key] = tweet[key];
                                        return obj;
                                      }, {});

                return minimalTweet;
              });

              userProfile["tweets"] = tweets;

              this.updateProfileList([userProfile]);

              this.profilesService
                .index(userProfile)
                .subscribe(
                res => {

                  if(res.msg) {
                    console.log("Profile " + userProfile.id + " indexed in ES");
                  }

                  this.loading = false;
                  this.assignInterests([userProfile]);
                });
            });
        }
      });
  };

  sort() {

    const label = this.sortForm.value.selectedSort.label;
    const field = this.sortForm.value.selectedSort.field;

    console.log("Sorting profiles by " + label + "(field: " + field + ")");

    this.profileList.sort(function(a, b) {

      return b[field] - a[field];
    }
   );
  };

  goToInterestsPage() {

    this.router.navigateByUrl('/interests');
  };
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
