import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CardService } from 'src/app/card/card.service';
import { TxnService } from 'src/app/txn/txn.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  constructor(private productService: ProductServiceService,
    private cardService: CardService,
    private txnService: TxnService,
    private toastService: ToastrService) { }

  products: IProduct[] = [];
  filterBy = '';

  ngOnInit(): void {
    this.getProducts();
  }

  async getProducts() {
    // this.productService.getProducts().subscribe((data) => {
    //   this.products = data;
    //   console.log(data);
    // })

    try {
      this.products = await firstValueFrom(this.productService.getProducts());
    } catch (error: any) {
      this.toastService.error(error.message);
    }
  }

  async deleteProduct(product: IProduct) {
    // this.productService.deleteProduct(_id).subscribe({
    //   next: () => {
    //     console.log('Product with id ' + _id + ' deleted');
    //     this.getProducts();
    //   },
    //   error: (err) => {
    //     console.error('Error while deleting product with id ' + _id);
    //     console.error(err);
    //   }
    // })

    try {
      await firstValueFrom(this.productService.deleteProduct(product._id));
      this.toastService.success('Product ' + product.name + ' deleted.');
      await this.getProducts();
      await firstValueFrom(this.txnService.deleteTxn(product.txnId));
      let cardInfo = await firstValueFrom(this.cardService.getCard(product.cardHolder));
        cardInfo.amountDue -= product.cardAmount;
        cardInfo.totalAmount -= product.cardAmount;
        await firstValueFrom(this.cardService.updateCard(cardInfo));
    } catch (error: any) {
      this.toastService.error(error.message);
    }
  }

  // cancelProduct(_id: any) {
  //   this.productService.deleteProduct(_id).subscribe({
  //     next: () => {
  //       console.log('Product with id ' + _id + ' deleted');
  //       this.getProducts();
  //     },
  //     error: (err) => {
  //       console.error('Error while deleting product with id ' + _id);
  //       console.error(err);
  //     }
  //   })
  // }
}
