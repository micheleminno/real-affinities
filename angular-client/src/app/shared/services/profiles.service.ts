import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { ApiService } from './api.service';
import { Profile, Interest } from '../models';


@Injectable()
export class ProfilesService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  profileList: Profile[] = [];
  rowsAmount: number = 0;
  profileImages: string[] = [];

  update(profile): Observable<Profile> {

    return this.apiService
      .put('/profile', { profile })
      .map(data => {
        return data.profile;
      });
  }

  updateProfileList(profiles: Profile[]): Observable<boolean> {

    var profilesToAdd = [];

    for (var profilesIndex in this.profileList) {

      this.profileList[profilesIndex]["status"] = "old";
    }

    if (profiles.length == 0) {

      return Observable.of(false);
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

    this.profileList = this.profileList.concat(profilesToAdd);
    this.rowsAmount += Math
      .ceil(profilesToAdd.length / 4);

    return Observable.of(true);
  }

  index(profile: Profile) {

    console.log("Indexing profile " + JSON.stringify(profile));

    return this.apiService
      .post('/profiles/index', profile);
  }

  loadProfiles(ids: string[]) {

    console.log("Loading " + ids.length + " profiles from ids");

    return this.apiService
      .get('/profiles/load?ids=' + ids);
  }

  updateProfileImg(profileId: string, normalImageUrl: string) {

    var biggerImageUrl = normalImageUrl.substring(0, normalImageUrl.lastIndexOf("normal"));
    biggerImageUrl = biggerImageUrl + "400x400";
    var resultUrl = biggerImageUrl + ".jpg";

    this.urlExists(resultUrl)
      .subscribe(
      (jpgFound: boolean) => {

        if (!jpgFound) {

          resultUrl = biggerImageUrl
            + ".jpeg";

          this.urlExists(resultUrl)
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

  urlExists(url: string) {

		return this.apiService.get('/utilities/url-exists?url=' + url)
					 .map(data => data);
	}

  getProfilesMatching(interest: Interest): Observable<Profile[]> {

    console.log("Getting profiles matching with interest " + interest.name);

    return this.apiService
      .get('/profiles/matching?name=' + interest.name + '&query=' + interest.query);
  }
}
