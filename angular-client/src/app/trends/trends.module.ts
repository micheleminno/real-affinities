import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared';
import { TrendsComponent } from './trends.component';


@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [
    TrendsComponent
  ]
})
export class TrendsModule { }
