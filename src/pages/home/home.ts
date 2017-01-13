import { Component } from '@angular/core';
import { NavController, LoadingController, Loading, ToastController, Toast } from 'ionic-angular';
import { Catalog } from '../../providers/Catalog';
import { Scrapper } from '../../providers/scrapper';
import { ShowDetails } from '../show/show.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [
    Catalog,
    Scrapper
  ]
})
export class Home {
  newItems: Array<any> = [];
  page:number = 0;
  error:Toast;
  loading: Loading;
  public goToShowCallback: Function;

  constructor(public navCtrl: NavController, 
    public catalogService: Catalog, 
    public loadingCtrl: LoadingController, 
    public toastCtrl: ToastController) {}

  public ngOnInit():void {
    this.getCatalog()
      .catch(this.handleError.bind(this));
    this.goToShowCallback = this.goToShow.bind(this);
  }

  ionViewWillLeave() {
    if(this.error) {
      // Prevent onDidDismiss to call again getCatalog.
      this.error.onDidDismiss(()=>{});
      
      this.error.dismiss();
    }
  }

  getCatalog():Promise<any> {
    this.loading = this.createLoader();

    this.loading.present();
    return this.catalogService
      .find('animemovil', this.page)
      .then(newItems => {
        this.page++;
        this.loading.dismiss();
        this.newItems = newItems;
        return Promise.resolve();
      })
  }

  goToShow(event, show):void  {
    this.navCtrl.push(ShowDetails, {
      showLink: show.link
    });
  }

  loadMore(infiniteScroll):void  {
    this.getCatalog()
      .then(() => infiniteScroll.complete())
      .catch(error => {
        infiniteScroll.complete();
        this.handleError(error);
      });       
  }

  createLoader():Loading  {
    return this.loadingCtrl.create({
      content: 'Loading data...'
    });
  }

  handleError(message: any):void {
    this.loading.dismiss();
    this.error = this.toastCtrl.create({
      message: message,
      position: 'bottom',
      closeButtonText: 'Try again',
      showCloseButton: true
    });

    this.error.onDidDismiss(()=> {
      this.getCatalog()
      .catch(this.handleError.bind(this));
    });

    this.error.present();
  }
}