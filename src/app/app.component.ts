import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/firestore';


export interface Item { name: string; }


@Component({
    selector: 'app-root',
    template: `
    <ul>
      <li *ngFor="let item of items | async">
        {{ item.name }}
      </li>
    </ul> `,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
    private itemsCollection: AngularFirestoreCollection<Item>;
    private itemDoc: AngularFirestoreDocument<Item>;

    item: Observable<Item>;
    items: Observable<any[]>;

  public appPages = [
    {
      title: '裝置測試頁',
      url: '/home',
      icon: 'home'
    },
    
    {
       title: '我愛你',
       url: '/test',
       icon: 'test'
    },
    {
        title: '我恨你',
        url: '/list',
        icon: 'list'
    },
  ];

    constructor(
     
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    firestore: AngularFirestore,
    private afs: AngularFirestore
    )

    {    
        this.itemsCollection = afs.collection<Item>('items');
        this.itemDoc = afs.doc<Item>('items/1');
        this.items = this.itemsCollection.valueChanges();
        this.initializeApp();
        this.items = firestore.collection('items').valueChanges();

    }

    addItem(item: Item) {
        this.itemsCollection.add(item);


    }
    /*
    create(item: Item) {
        this.itemDoc = afs.doc<Item>('items/1').set(item)
    }*/
    
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
