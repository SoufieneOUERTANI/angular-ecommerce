import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/common/product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products!: Product[];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode!: boolean;

  // New properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(private productService: ProductService,
    private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => { this.listProducts(); });
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();

    }
  }
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    this.productService.searchProductsPaginate(this.thePageNumber - 1,
      this.thePageSize,
      theKeyword).subscribe(this.processResult())
  }

  handleListProducts() {

    //check if "id" is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')
    if (hasCategoryId) {
      // get the id param String, convert String to number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }
    else {
      // get the id param String, convert String to number using the "+" symbol
      this.currentCategoryId = 1;
    }

    //
    // Check if we have a different category than previous
    // Note : Angular will reuse a component if it is currently been viewed 
    //

    // If we have a different category than previous 
    // then set pageNumber back to one
    if (this.currentCategoryId != this.previousCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thepageNumber=${this.thePageNumber}`)

    //Get the products for the given category id
    /*     this.productService.getProductList(this.currentCategoryId).subscribe(
          data => {
            this.products = data;
          }
        ) */
    this.productService.getProductListPaginate(this.thePageNumber - 1,
      this.thePageSize,
      this.currentCategoryId)
      .subscribe(this.processResult());
  }
  processResult(): any {
    return (data: { _embedded: { products: Product[]; }; page: { number: number; size: number; totalElements: number; }; }) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }

  updatePageSize(pageSize: number) {
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

}
