import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
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
    private http: Http
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

        this.updateProfileImg(profileId, actualImageUrl);

        profilesToAdd.push(profiles[newProfilesIndex]);
      }
    }

    this.profileList = this.profileList.concat(profilesToAdd);
    this.rowsAmount += Math
      .ceil(profilesToAdd.length / 4);

    return Observable.of(true);
  }

  index(profile: Profile) {

    return this.apiService
      .get('/profiles/index?name=' + profile.name);
  }

  loadProfiles(ids: string[]) {

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
              console.log("Img url: " + resultUrl);

              this.profileImages[profileId] = resultUrl;
            });
        } else {

          console.log("Img url: " + resultUrl);

          this.profileImages[profileId] = resultUrl;
        }
      });
  };

  urlExists(url: string) {

		return this.apiService.get('/utilities/url-exists?url=' + url)
					 .map(data => data);
	}

  getProfilesMatching(interest: Interest): Observable<Profile[]> {

    return this.apiService
      .get('/profiles/matching?name=' + interest.name + '&query=' + interest.query);
  }
}
