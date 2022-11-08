import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from '../product';
import { ProductServiceService } from '../product-service.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct: IProduct | undefined;
  originalProduct: IProduct | undefined;

  ngOnInit(): void {
    let id = this.route.snapshot.params['id'];
    if (id == 0) {
      this.pageTitle = 'Add Product';
    }
    this.productService.getProduct(id).subscribe((product) => {
      this.originalProduct = product;
      this.originalProduct = product;
    });
  }

}
