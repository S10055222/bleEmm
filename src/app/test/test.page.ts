import { Component, OnInit, Input } from '@angular/core';
import { HomePage } from '../../app/home/home.page';

@Component({
    selector: 'app-test',
    templateUrl: 'test.page.html',
    styleUrls: ['test.page.scss']
})

export class TestPage implements OnInit {
   value = 100;
   pluse = 0;
    firstChange = true;
    lastPrice;
    @Input() price;
    ngOnInit() {
       
        document.getElementById("value").innerHTML = "100";
        document.getElementById("pluse").innerHTML = "0";
        setInterval(() => {
            this.value += 2;
            var a = this.value.toString()
            document.getElementById("value").innerHTML = a;

            this.pluse += 1;
            var b = this.pluse.toString()
            document.getElementById("pluse").innerHTML = b;
        }, 1000);
        


    };


     increase() {
        this.value += 2;
        var a = this.value.toString()
        document.getElementById("value").innerHTML = a;

    }

    decrease() {
        this.value -= 2;
        var a = this.value.toString()
        document.getElementById("value").innerHTML = a;

    }
}