import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  constructor(private productService: ProductServiceService) { }

  products: IProduct[] = [];
  filterBy = '';

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
      console.log(data);
    })
  }

  deleteProduct(_id: any) {
    this.productService.deleteProduct(_id).subscribe({
      next: () => {
        console.log('Product with id ' + _id + ' deleted');
        this.getProducts();
      },
      error: (err) => {
        console.error('Error while deleting product with id ' + _id);
        console.error(err);
      }
    })
  }
  cancelProduct(_id: any) {
    this.productService.deleteProduct(_id).subscribe({
      next: () => {
        console.log('Product with id ' + _id + ' deleted');
        this.getProducts();
      },
      error: (err) => {
        console.error('Error while deleting product with id ' + _id);
        console.error(err);
      }
    })
  }
}
