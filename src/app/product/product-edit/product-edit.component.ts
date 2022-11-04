import { Component, OnInit } from '@angular/core';
import { IProduct } from '../product';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  constructor() { }

  pageTitle = 'Add Product';
  private currentProduct: IProduct;
  private originalProduct: IProduct;

    ngOnInit(): void {
      
    }

}
