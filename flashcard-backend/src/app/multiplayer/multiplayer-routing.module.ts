import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiplayerPage } from './multiplayer.page';

const routes: Routes = [
  {
    path: '',
    component: MultiplayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiplayerPageRoutingModule {}
