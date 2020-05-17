import { Component, OnInit, Input } from '@angular/core';
import { HomePage } from '../../app/home/home.page';
import { EmmDataService } from '../../core/services/emm-data.service';
@Component({
    selector: 'app-test',
    templateUrl: 'test.page.html',
    styleUrls: ['test.page.scss']
})

export class TestPage implements OnInit {
  
    firstChange = true;
    lastPrice;
    @Input() price;
    constructor(
        private emmDataService: EmmDataService
    ) { }

    ngOnInit() {

        document.getElementById("value").innerHTML = this.emmDataService.value;
        document.getElementById("pluse").innerHTML = "0";

        //setInterval(() => {
        //    this.emmDataService.value += 2;
        //    var a = this.emmDataService.value.toString()
        //    document.getElementById("value").innerHTML = a;

     
        //}, 1000);
        

    };

     increase() {
         this.emmDataService.value += 2;
         var a = this.emmDataService.value.toString()
        document.getElementById("value").innerHTML = a;

    }

    decrease() {
        this.emmDataService.value -= 2;
        var a = this.emmDataService.value.toString()
        document.getElementById("value").innerHTML = a;

    }
}