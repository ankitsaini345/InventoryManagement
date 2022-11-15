import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Icard, IcardTxn } from 'src/app/card/card';
import { CardService } from 'src/app/card/card.service';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;
  cards!:Icard[];
  cardFilter = '';

  ngOnInit(): void {
    let id = this.route.snapshot.params['id'];
    if (id == 0) {
      this.pageTitle = 'Add Product';
    }
    this.productService.getProduct(id).subscribe((product) => {
      this.currentProduct = product;
      this.originalProduct = product;
    });
    this.cardService.getCards().subscribe((data) => {
      this.cards = data;
    })
  }

  saveProduct() {
    if (this.currentProduct.id == 0) {
      this.productService.addProducts(this.currentProduct).subscribe((data) => {
        console.log(data);
        const txn: IcardTxn = {
          id: null,
          amount: this.currentProduct.cardAmount,
          orderId: this.currentProduct.id,
          txnDate: this.currentProduct.date,
          OrderName: this.currentProduct.name
        }
        this.cardService.addCardTxn(this.currentProduct.cardHolder, txn);
      });

    } else {
      this.productService.editProducts(this.currentProduct).subscribe({
        next: () => console.log('Product ' + this.currentProduct.name + ' edited.'),
        error: () => console.error('Error in editing product: ' + this.currentProduct.name)
        
      })
    }
    this.router.navigate(['/products'])
  }

  resetProduct() {
    this.productService.getProduct(0).subscribe((product) => {
      this.currentProduct = product;
      this.originalProduct = product;
    });
  }

}
