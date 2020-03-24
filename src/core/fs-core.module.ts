import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleCommandService } from './services/ble-command.service';
import { EmmParserService } from './services/emm-parser.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers:[
    //BleCommandService,
    EmmParserService
  ]
})
export class FsCoreModule { }
