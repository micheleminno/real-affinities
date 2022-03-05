import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProfilesComponent } from './profiles.component';
import { SharedModule } from '../shared';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ProfilesComponent
  ],
  providers: []
})
export class ProfilesModule {}
