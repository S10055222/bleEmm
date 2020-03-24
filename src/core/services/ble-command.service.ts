import { Injectable } from '@angular/core';

@Injectable()
export class BleCommandService {
  currDevice = null;
  badTxCount = 0;
  wait4DataStartTS = 0;
  lastRxTimestamps = 0;
  listedDevices = [];


  constructor() { }

  onenterIDLE(ev, from, to, msg){
			// logFsmEv(ev, from, to, msg);

			if (this.currDevice) {
			// 	$ble.disconnect(sys.currDevice.id);
			 	this.currDevice = null;
			}

			// quitTalkingWDT();
			// stopListing(true);

			 this.badTxCount = 0;
			 this.wait4DataStartTS = 0;
			 this.lastRxTimestamps = 0;
			// setNumScans(0);
			 if (from == 'INIT') return;

			// if ((from == 'LISTING') || (from == 'CONNECTING'))
			// 	emitSignal("bt:CONN", 'NG');
			// else
			// 	emitSignal("bt:CONN", 'OFF');
  }

  onenterLISTING(){
    //logFsmEv(ev, from, to);

			//quitTalkingWDT();

			// this.listedDevices = [];
			// this.listOkCb = okCb;
			// this.listErrCb = errCb;

			// if (from == 'CONNECTING') {
			// 	console.log("from connecting, skip reseting numscans");
			// } else
			// 	setNumScans(CONFIG_NUM_SCANS);

			// quickScan();
			// return true; // execute!

  }
  onenterCONNECTING(){

  }
  onenterWAITING4DATA(){

  }
  onenterTALKING(){

  }
  onleaveCONNECTING(){

  }

  onleaveTALKING(){

  }

}
