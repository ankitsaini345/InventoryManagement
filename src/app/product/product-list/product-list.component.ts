import { Component, OnInit } from '@angular/core';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  constructor( private productService: ProductServiceService) { }

  products: IProduct[] = [];
  filteredProducts: IProduct[] = [];

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      console.log(data);
      this.products = data;
    })
  }

}
