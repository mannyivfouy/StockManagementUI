import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../services/api/category.service';

interface CategoryFormControls {
  categoryName: FormControl;
  status: FormControl;
  description: FormControl;
}

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css',
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  categoryForm!: FormGroup;
  isEdit = false;
  categoryId: string | null = null;

  loading = false; // for load existing
  saving = false; // for submit
  error = '';

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const paramId =
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.paramMap.get('categoryID');

    if (paramId) {
      this.isEdit = true;
      this.categoryId = paramId;
      this.loadCategoryAndPatch(paramId);
    }
  }

  private buildForm() {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      status: [null as boolean | null, Validators.required],
      description: [''],
    });
  }

  // private loadCategoryAndPatch(id: any) {
  //   this.loading = true;
  //   const s = this.categoryService.getCategoryById(id).subscribe({
  //     next: (cat: any) => {
  //       // Defensive: adapt to different backend field names
  //       const categoryName = cat.categoryName ?? cat.name ?? '';
  //       const status = cat.status ?? cat.isActive ?? null;
  //       const description = cat.description ?? cat.desc ?? '';

  //       this.categoryForm.patchValue({
  //         categoryName,
  //         status : !!status,
  //         description : cat.description ?? cat.desc ?? ''
  //       });

  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Failed to load category', err);
  //       this.error = err?.error?.message || 'Failed to load category';
  //       this.loading = false;
  //     },
  //   });

  //   this.subs.push(s);
  // }

  private loadCategoryAndPatch(id: any) {
    this.loading = true;
    const s = this.categoryService.getCategoryById(id).subscribe({
      next: (cat: any) => {
        // Defensive: adapt to different backend field names
        const categoryName = cat.categoryName ?? cat.name ?? '';

        // Normalize status to boolean
        let status = cat.status ?? cat.isActive ?? null;
        status = status === true || status === 'true' || status === 1;

        const description = cat.description ?? cat.desc ?? '';

        this.categoryForm.patchValue({
          categoryName,
          status, // correctly boolean
          description, // use the variable, not cat.description
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load category', err);
        this.error = err?.error?.message || 'Failed to load category';
        this.loading = false;
      },
    });

    this.subs.push(s);
  }

  get f(): CategoryFormControls {
    return this.categoryForm.controls as unknown as CategoryFormControls;
  }

  submitCategoryForm() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    // prepare payload to match your backend
    const payload: any = {
      categoryName: this.categoryForm.value.categoryName,
      status: this.categoryForm.value.status === true,
      description: this.categoryForm.value.description,
    };

    if (this.isEdit && this.categoryId) {
      const s = this.categoryService
        .updateCategoryById(this.categoryId, payload)
        .subscribe({
          next: (res) => {
            console.log('Category updated', res);

            this.saving = false;
            // navigate back to list
            this.router
              .navigate(['/category'])
              .catch((err) => console.error('Navigate error', err));
          },
          error: (err) => {
            console.error('Update failed', err);
            this.error = err?.error?.message || 'Update failed';
            this.saving = false;
          },
        });
      this.subs.push(s);
    } else {
      const s = this.categoryService.createCategory(payload).subscribe({
        next: (res) => {
          console.log('Category created', res);
          this.saving = false;
          this.router
            .navigate(['/category'])
            .catch((err) => console.error('Navigate error', err));
        },
        error: (err) => {
          console.error('Create failed', err);
          this.error = err?.error?.message || 'Create failed';
          this.saving = false;
        },
      });
      this.subs.push(s);
    }
  }

  onCancel() {
    // if user clicks cancel or wants to return
    this.router
      .navigate(['/category'])
      .catch((err) => console.error('Navigate error', err));
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
