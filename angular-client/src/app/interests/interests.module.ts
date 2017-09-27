import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared';
import { InterestsComponent } from './interests.component';


@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    InterestsComponent
  ]
})
export class InterestsModule { }
