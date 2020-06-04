import { Injectable } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';

enum AppStatus {
    INIT,
    SCAN,
    CONNECTION,
    TALKING,
    //Extra Status
    TALKING_TO_SCAN,
}

@Injectable({
  providedIn: 'root'
})


export class EmmDataService {

    pluse: any;
    value: any;
    upset: any;
    downset: any;

    constructor() {
        this.pluse = 0;
        this.value = 0;
        this.upset = 0;
        this.downset = 0;
        
    }
}
