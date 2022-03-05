import { BrowserModule } from '@angular/platform-browser';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';

import { FooterComponent, HeaderComponent } from './shared/layout';
import { ProfilesModule } from './profiles/profiles.module';
import { InterestsModule } from './interests/interests.module';

import { ProfilesComponent } from './profiles/profiles.component';
import { InterestsComponent } from './interests/interests.component';


import {
  ApiService,
  ProfilesService,
  InterestsService,
  TargetService,
  TwitterService
} from './shared/services';

const appRoutes: Routes = [
  { path: '', component: ProfilesComponent, pathMatch: 'full' },
  { path: 'interests', component: InterestsComponent }
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
    InterestsModule
  ],
  providers: [
    ApiService,
    ProfilesService,
    InterestsService,
    TargetService,
    TwitterService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
