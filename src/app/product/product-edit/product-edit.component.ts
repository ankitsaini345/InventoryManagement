import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private productService: ProductServiceService) { }

  pageTitle = 'Edit Product';
  currentProduct!: IProduct;
  originalProduct!: IProduct;

  ngOnInit(): void {
    let id = this.route.snapshot.params['id'];
    if (id == 0) {
      this.pageTitle = 'Add Product';
    }
    this.productService.getProduct(id).subscribe((product) => {
      this.currentProduct = product;
      this.originalProduct = product;
    });
  }

  saveProduct() {
    if (this.currentProduct.id == 0) {
      this.productService.addProducts(this.currentProduct).subscribe({
        next: () => console.log(this.currentProduct.name + ' saved.'),
        error: () => console.error('Error in saving product ' + this.currentProduct.name)
      });
    } else {
      this.productService.editProducts(this.currentProduct).subscribe({
        next: () => console.log('Product ' + this.currentProduct.name + ' edited.'),
        error: () => console.error('Error in editing product: ' + this.currentProduct.name)
        
      })
    }
    this.router.navigate(['/products'])
  }

  deleteProduct() {
    this.productService.getProduct(0).subscribe((product) => {
      this.currentProduct = product;
      this.originalProduct = product;
    });
  }

}
