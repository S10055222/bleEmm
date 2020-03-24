export class AppConst{
    static UART_SERVICE:string               = '6e400001-b5a3-f393-e0a9-e50e24dcca9e'; // 服务
    static UART_TX_CHAR_WRITE:string   = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; //写入/Write Characteristics (App → emm)
    static UART_RX_CHAR_NOTIFY:string  = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // 通知/Notify Characteristics
    static CONFIG_NUM_SCANS: number = 20;
    static KEEPALIVE_CHECK_TIME: number = 1000;

}