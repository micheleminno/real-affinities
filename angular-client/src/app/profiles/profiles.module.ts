import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProfilesComponent } from './profiles.component';
import { SharedModule } from '../shared';
import { RangePipe } from './range.pipe';
import { OrderByPipe } from './order-by.pipe';
import { FilterPipe } from './filter.pipe';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    ProfilesComponent,
    RangePipe,
    OrderByPipe,
    FilterPipe
  ],
  providers: []
})
export class ProfilesModule {}
