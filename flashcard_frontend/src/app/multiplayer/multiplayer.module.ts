import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiplayerPageRoutingModule } from './multiplayer-routing.module';

import { MultiplayerPage } from './multiplayer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiplayerPageRoutingModule
  ],
  declarations: [MultiplayerPage]
})
export class MultiplayerPageModule {}
