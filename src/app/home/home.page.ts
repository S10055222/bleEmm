import { Component, OnInit, NgZone, EventEmitter } from '@angular/core';
import { BLE } from '@ionic-native/ble/ngx';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { AppConst } from 'src/AppConst';
import { EmmParserService } from '../../core/services/emm-parser.service';
import { EmmDataService } from '../../core/services/emm-data.service';

export class DeviceInfo {
  id: string;
  advertising: any;
  rssi: Number;
  timestamp: Date;
  name: string; //Device name == 'emm' 
   

  constructor(x) {
    this.id = x.id;
    this.name = x.name;
    this.advertising = x.advertising;
    this.rssi = x.rssi;
    this.timestamp = new Date();
  }


  update(x) {
    this.advertising = x.advertising;
    this.rssi = x.rssi;
    this.timestamp = new Date();
  }
}

export class DataTransformModel {
  x: number;
  z: number
  y: number;
  timeStamp: number;
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.timeStamp = new Date().getTime();
  }

}
enum AppStatus {
  INIT,
  SCAN,
  CONNECTION,
  TALKING,
  //Extra Status
  TALKING_TO_SCAN,
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    //pluse = 0;
 
    //ionViewDidLoad() {
    //    console.log(`Ionic觸發ionViewDidLoad`);
    //}

    constructor(
        private platform: Platform,
        private bleDevice: BLE,
        private emmService: EmmParserService,
        private emmDataService: EmmDataService,
        private zone: NgZone
                )
    { }


    //APP status
  _AppStatus = AppStatus;
  appStatus: AppStatus = AppStatus.INIT;
  //目前指令
  currentCmdMode;

  datas: any = [];

  connectedDevice: DeviceInfo;

  onAppStatusEvent: EventEmitter<AppStatus> = new EventEmitter();

  //Recevied
  currentEmmData: DataTransformModel;
  batVolt;
  emmSwInfo = {
    protoVerMajor: '-',
    protoVerMinor: '-',
    swVerMajor: '-',
    swVerMinor: '-'
  };
  //Cmd-Queue
  txQ = [];

    ngOnInit() {
       
    }

    //increase() {
    //    this.emmDataService.pluse += 2;
    //    var a = this.emmDataService.pluse.toString()
    //    document.getElementById("pluse").innerHTML = a;
    //}

    //decrease() {
    //    this.emmDataService.pluse -= 2;
    //    var a = this.emmDataService.pluse.toString()
    //    document.getElementById("pluse").innerHTML = a;
    //}

  //Interval Dispatcher
  txQDispatcher = null;
  keepAliveDispatcher = null;
  scanBtDispatcher = null;
  //Log
  logs = [];

  ionViewWillEnter() {
    this.onAppStatusEvent.subscribe((status: AppStatus) => {
      switch (status) {
        case AppStatus.INIT:
          break;
        case AppStatus.SCAN:
          this.appStatus = AppStatus.SCAN;
          this.scanAllDevice();
          this.removeDeviceFromListIfTimeout(5000);
          break;
        case AppStatus.CONNECTION:
          this.appStatus = AppStatus.CONNECTION;
          this.bleDevice.stopScan().finally(() => {
            this.clearBtDispatch();
            this.clearDevice();
          });
          break;
        case AppStatus.TALKING:
          this.appStatus = AppStatus.TALKING;
          this.setMode(0); this.currentCmdMode = 0;//1.裝置狀態回到 Idle
          this.keepAliveTimer();  //2.問裝置是否還活著  
          //3.註冊通知訊息
          this.bleDevice.startNotification(this.connectedDevice.id, AppConst.UART_SERVICE, AppConst.UART_RX_CHAR_NOTIFY).subscribe(data => {
            this.zone.run(() => {
              this.recevieData(data);
            });
          }, (err) => { alert('RX or Service Error') });

          break;
        case AppStatus.TALKING_TO_SCAN:
          this.appStatus = AppStatus.TALKING_TO_SCAN;
          this.bleDevice.disconnect(this.connectedDevice.id);
          this.clearTxQDispatcher();
          this.clearKeepAliveDispatcher();
          this.clearDebugInfo();
          this.onAppStatusEvent.emit(AppStatus.SCAN);
          break;
        default:
          break;

      }

    });
    this.platform.ready().then(() => {
      this.onAppStatusEvent.emit(AppStatus.SCAN);
    });
  }


  /**
   * 掃描 裝置
   */
  private scanAllDevice() {
    this.bleDevice.startScanWithOptions([], { reportDuplicates: true }).subscribe(x => {
      this.zone.run(() => {
        if (x.name != 'emm') return;
        var index = _.findIndex(this.datas, (item) => { return item.id == x.id });
        if (index == -1) {
          this.datas.push( new DeviceInfo(x));
        }
        else {
          this.datas[index].update(x);
        }
      });

    });
  }
  /**
   *  移除藍芽清單內沒更新的資料
   * @param timeout millsec
   */
  private removeDeviceFromListIfTimeout(timeout: number) {
    if (!this.scanBtDispatcher) {
      this.scanBtDispatcher = setInterval(() => {
        var date = Date.now();
        this.datas = _.filter(this.datas, (element) => {
          return date - element.timestamp.getTime() < timeout;
        });
      }, timeout);
    } else {
      clearInterval(this.scanBtDispatcher);
      this.scanBtDispatcher();
      this.removeDeviceFromListIfTimeout(5000);
    }
  }


  connect(item: DeviceInfo) {
    this.connectedDevice = item;
    this.onAppStatusEvent.emit(AppStatus.CONNECTION);
    this.bleDevice.connect(this.connectedDevice.id).subscribe(() => {
      this.onAppStatusEvent.emit(AppStatus.TALKING);
    }, (res) => {
      this.onAppStatusEvent.emit(AppStatus.SCAN);
    });
  }



  keepAliveTimer() {
    if (!this.keepAliveDispatcher) {
      this.keepAliveDispatcher = setInterval(() => {
        var buf = new Uint8Array(6);
        for (var i = 0; i < 6; i++) {
          buf[i] = i + 1;
        }
        this.pushAndConsume(this.emmService.EMM_COMMANDS.ProtoverSwverState, buf);
      }, AppConst.KEEPALIVE_CHECK_TIME);
    } else {
      clearInterval(this.keepAliveDispatcher);
      this.keepAliveDispatcher = null;
      this.keepAliveTimer();
    }
  }

  //push cmd to queue 
  private pushAndConsume(func: number, buf: Uint8Array) {
    this.txQ.push({ func: func, data: buf });
    //第一次建立Interval(100ms) 執行 txQ 指令
    if (!this.txQDispatcher) {
      this.consumeTxQ();
    }
    this.enableTxQDispatcher(true);

  }
  //建立interval(100ms)  執行 queue 的cmd
  private enableTxQDispatcher(enable) {
    /* Schedule a poller to consume the queued tx commands */
    if (enable) {
      if (this.txQDispatcher)
        return;
      this.txQDispatcher = setInterval(() => { this.consumeTxQ() }, 100);
      return;
    } else if (this.txQDispatcher) {
      /* Disable */
      clearInterval(this.txQDispatcher);
      this.txQDispatcher = null;
      this.txQ = [];
    }
  }

  private consumeTxQ() {
    var commands = [];
    while (1) {
      var o = this.txQ.shift();
      if (o) {
        commands.push(o);
        if (commands.length >= 2) {
          break;
        }
      } else
        break;
    }
    if (commands.length > 0) {
      var buf = new Uint8Array(this.emmService.NUM_BYTES * commands.length);
      var index = 0;

      for (var i = 0; i < commands.length; i++) {
        var o = commands[i];
        var cmdBuf = this.emmService.fmtCommand(o.func, o.data);
        for (var j = 0; j < this.emmService.NUM_BYTES; j++) {
          buf[index++] = cmdBuf[j];
        }
      }
      var promise = this.bleDevice.writeWithoutResponse(this.connectedDevice.id, AppConst.UART_SERVICE, AppConst.UART_TX_CHAR_WRITE, buf.buffer);
      promise.then(() => {
        this.writeLog('Success,excute cmd fallbak');
      }, () => {
        this.writeLog('Error,could excute Cmd');
      });
    }
  }
  //處理收到的資料
  private recevieData(data) {
    var buf = new Uint8Array(data);
    let accParserData = {
      rxbuf: new Uint8Array(this.emmService.NUM_BYTES),
      pos: 0,
      fcsErrorCount: 0
    };


    for (var i = 0; i < buf.length; i++) {
      let accCmd = this.emmService.pushByte(accParserData, buf[i]);

      if (accCmd === null) continue;
      if (typeof accCmd == 'undefined') continue;

        if (accCmd.func <= this.emmService.EMM_COMMANDS.DataIndexEnd) {

            let data = new DataTransformModel(accCmd.x, accCmd.y, accCmd.z);

            this.currentEmmData = data;

            if ( accCmd.z == -6000) {
                this.emmDataService.upset = 1;
            }

            if (accCmd.z == -8000) {
                this.emmDataService.downset = 1;
            }

            if ((this.emmDataService.upset == 1) && (this.emmDataService.downset == 1)) {
                this.emmDataService.upset = 0;
                this.emmDataService.downset = 0;
            }
            //if (accCmd.x >= 800) {
            //    this.emmDataService.pluse += 1;
            //    var a = this.emmDataService.pluse.toString()
            //    document.getElementById("pluse").innerHTML = a;
            //}

            ////////////////////////////////////////////////////////////////////////
            //document.getElementById("pluse").innerHTML = "0";
            //setInterval(() => {
            //    this.qqq += 2;
            //    var b = this.qqq.toString()
            //    document.getElementById("qqq").innerHTML = b;
            //}, 1000);
            ////////////////////////////////////////////////////////////////////////

           
        //})


        // if (!sys.paused)
        // 	updateMotionStates(accCmd);

        //if (this.dataInterval === 0) {
        // 	/*
        // 	 * If we get the accelerometer data, but we are not in streaming mode,
        // 	 * we probably want to send the stop command.
        // 	 */
        //	this.setMode(this.dataInterval);
        //}
        continue;
      }

      if (accCmd.func == this.emmService.EMM_COMMANDS.Alive) {
        // console.log("#### got alive");
        this.batVolt = ((accCmd.data[0] << 8) | accCmd.data[1]) / 1000.0;
        //if (this.dataInterval > 0) {
        // 	/*
        // 	 * If we get the ALIVE command, but we are not in IDLE mode,
        // 	 * we probably want to re-send the streaming start command.
        // 	 */
        //this.setMode(this.dataInterval);
        //}
        continue;
      }



      if (accCmd.func == this.emmService.EMM_COMMANDS.ReadRegRaw) {
        // console.log("got read reg raw");
        // dumpArray("--- read reg raw data ---", accCmd.data, 6);
        continue;
      }

      if (accCmd.func == this.emmService.EMM_COMMANDS.WriteRegRaw) {
        console.log("got write reg raw");
        continue;
      }

      if (accCmd.func == this.emmService.EMM_COMMANDS.ProtoverSwverState) {
        // console.log("Got proto/sw/state");
        // console.log("  proto: " +accCmd.x);
        // console.log("  sw: " +accCmd.y);
        // console.log("  state: " +accCmd.z);
        this.emmSwInfo.protoVerMajor = accCmd.data[0];
        this.emmSwInfo.protoVerMinor = accCmd.data[1];

        this.emmSwInfo.swVerMajor = accCmd.data[2];
        this.emmSwInfo.swVerMinor = accCmd.data[3];
      }

    }

  }

//設定
  setMode(msec) {
    var buf = new Uint8Array(6);
    /* SET INTERVAL MODE: 0x01 0x00 */
    buf[0] = 0x01;
    buf[1] = 0x00;
    /* Interval */
    buf[2] = 0x00;
    buf[3] = 0x00;
    buf[4] = (msec >> 8) & 0xff;
    buf[5] = msec & 0xff;

    //this.dataInterval = msec;
    this.pushAndConsume(this.emmService.EMM_COMMANDS.SetMode, buf);
  }

  /**
   * 休眠模式等於斷線，送 4 次(確認跑到休眠)
   */
  sleepMode() {
    /* Set sleep mode: 0x02:0xaa:0xbb:0xcc:0xdd:0xee */
    var buf = new Uint8Array(6);
    buf[0] = 0x02;
    buf[1] = 0xaa;
    buf[2] = 0xbb;
    buf[3] = 0xcc;
    buf[4] = 0xdd;
    buf[5] = 0xee;
    for (var i; i < 4; i++) {
      this.pushAndConsume(this.emmService.EMM_COMMANDS.SetMode, buf);
    }

    this.onAppStatusEvent.emit(AppStatus.TALKING_TO_SCAN);
  }
  //升級硬體目前不使用
  DFUMode() {
    var buf = new Uint8Array(6);
    /* Set DFU mode : 0xdf:0x12:0x34:0x56:0x78:0x9a */
    buf[0] = 0xdf;
    buf[1] = 0x12;
    buf[2] = 0x34;
    buf[3] = 0x56;
    buf[4] = 0x78;
    buf[5] = 0x9a;
    for (var i; i < 4; i++) {
      this.pushAndConsume(this.emmService.EMM_COMMANDS.SetMode, buf);
    }
  }

  //====Clear && Reset Data

  clearDevice() {
    this.datas = [];
  }
  private clearBtDispatch() {
    if (this.scanBtDispatcher) {
      clearInterval(this.scanBtDispatcher);
      this.scanBtDispatcher = null;
    }
  }
  private clearTxQDispatcher() {
    if (this.txQDispatcher) {
      clearInterval(this.txQDispatcher);
      this.txQDispatcher = null;
    }

  }
  private clearKeepAliveDispatcher() {
    if (this.keepAliveDispatcher) {
      clearInterval(this.keepAliveDispatcher);
      this.keepAliveDispatcher = null;
    }
  }
  private clearDebugInfo() {
    this.connectedDevice = null;
    this.logs = [];
  }
  //=====Debug 
  private writeLog(text) {
    if (this.logs.length > 1) {
      this.logs.shift();
    }
    this.logs.push({ text: text, timestamp: new Date() })
  }
}
