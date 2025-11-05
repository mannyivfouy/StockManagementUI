import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, Category } from '../../../services/api/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  imagePreview: string | ArrayBuffer | null = null;
  selectedImageFile!: File;
  editMode = false;
  editingProductID: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editMode = true;
      this.editingProductID = Number(idParam);
      // Load product after categories
      this.productService.getProductById(this.editingProductID).subscribe({
        next: (p) => this.patchFormForEdit(p),
        error: (err) => console.error(err),
      });
    }
  }

  private initForm() {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      price: [null, [Validators.required]],
      categoryID: [null, Validators.required],
      stock: [0, Validators.required],
      status: [true, Validators.required],
      description: [''],
      productImage: [''],
    });
  }

  private loadCategories() {
    this.productService.getAllCategory().subscribe({
      next: (cats) => (this.categories = cats || []),
      error: (err) => console.error(err),
    });
  }

  private patchFormForEdit(p: Product | null) {
    if (!p) return;
    this.productForm.patchValue({
      productName: p.productName || '',
      price: p.price ?? null,
      categoryID: p.categoryID ?? null,
      stock: p.stock ?? 0,
      status: p.status === undefined ? true : p.status,
      description: p.description || '',
      productImage: p.productImage || '',
    });
    if (p.productImage) this.imagePreview = p.productImage;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onCancel() {
    this.router.navigate(['/product']);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const raw = this.productForm.value;
    const fd = new FormData();

    fd.append('productName', raw.productName);
    fd.append('price', String(raw.price));
    fd.append('stock', String(raw.stock));
    fd.append('categoryID', String(raw.categoryID));
    fd.append('status', String(raw.status));
    fd.append('description', raw.description || '');
    if (this.selectedImageFile) {
      fd.append('image', this.selectedImageFile);
    } else if (raw.productImage) {
      fd.append('image', raw.productImage);
    }

    if (this.editMode && this.editingProductID) {
      this.productService
        .updateProductById(this.editingProductID, fd)
        .subscribe({
          next: (res) => {
            console.log('Product updated', res);
            this.router.navigate(['/product']);
          },
          error: (err) => console.error(err),
        });
    } else {
      this.productService.createProduct(fd).subscribe({
        next: (res) => {
          console.log('Product created', res);
          this.router.navigate(['/product']);
        },
        error: (err) => console.error(err),
      });
    }
  }
}
