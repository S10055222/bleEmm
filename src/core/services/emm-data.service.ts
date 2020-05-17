import { Injectable } from '@angular/core';
import { Component, OnInit, Input } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmmDataService implements OnInit{

    pluse: any;
    value: any;
    constructor() {
        this.pluse = 0;
        this.value = 0;
    }

    ngOnInit() {

        document.getElementById("value").innerHTML = "100";
        
    };
}
