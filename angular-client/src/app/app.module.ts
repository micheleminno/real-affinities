import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { FooterComponent, HeaderComponent } from './shared/layout';
import { ProfilesModule } from './profiles/profiles.module';
import { InterestsModule } from './interests/interests.module';
import { TrendsModule } from './trends/trends.module';

import { ProfilesComponent } from './profiles/profiles.component';
import { InterestsComponent } from './interests/interests.component';
import { TrendsComponent } from './trends/trends.component';


import {
  ApiService,
  ProfilesService,
  InterestsService,
  TargetService,
  TwitterService,
  TrendsService
} from './shared/services';

const appRoutes: Routes = [
  { path: '', component: ProfilesComponent, pathMatch: 'full' },
  { path: 'interests', component: InterestsComponent },
  { path: 'trends', component: TrendsComponent }
];
const rootRouting = RouterModule.forRoot(
  appRoutes,
  { enableTracing: true } // <-- debugging purposes only
);

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    rootRouting,
    ProfilesModule,
    InterestsModule,
    TrendsModule
  ],
  providers: [
    ApiService,
    ProfilesService,
    InterestsService,
    TargetService,
    TwitterService,
    TrendsService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
