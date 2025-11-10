import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Product, Category } from '../services/api/store.service';

interface CartItem {
  product: Product;
  qty: number;
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];

  // UI state
  showCart = false;
  showConfirmPopup = false;
  searchTerm = '';
  selectedCategory: string | null = null;
  currentPage = 1;
  pageSize = 8;
  cartItems: CartItem[] = [];

  constructor(private service: StoreService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts() {
    this.service.getProducts().subscribe((res) => (this.products = res));
  }

  loadCategories() {
    this.service
      .getCategories()
      .subscribe((res) => (this.categories = res.map((c) => c.categoryName)));
  }

  get filteredProducts(): Product[] {
    let filtered = this.products.slice();

    if (this.selectedCategory)
      filtered = filtered.filter(
        (p) => p.categoryName === this.selectedCategory
      );
    if (this.searchTerm)
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );

    return filtered;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
  }

  get paginatedProducts(): Product[] {
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.currentPage = 1;
  }
  clearCategoryFilter() {
    this.selectedCategory = null;
    this.currentPage = 1;
  }
  onSearch() {
    this.currentPage = 1;
  }

  // inside StoreComponent
  getProductImage(product: Product): string {
    // If backend image exists, prepend server URL
    if (
      product.productImage &&
      !product.productImage.includes('assets/default-product.png')
    ) {
      return `http://localhost:4000${product.productImage}`;
    }
    return 'assets/default-product.png';
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }
  addToCart(product: Product) {
    const existing = this.cartItems.find(
      (c) => c.product.productID === product.productID
    );
    if (existing) existing.qty += 1;
    else this.cartItems.push({ product, qty: 1 });
  }

  isInCart(product: Product): boolean {
    return this.cartItems.some(
      (c) => c.product.productID === product.productID
    );
  }
  increaseQty(item: CartItem) {
    item.qty += 1;
  }
  decreaseQty(item: CartItem) {
    item.qty = Math.max(1, item.qty - 1);
  }
  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter((c) => c !== item);
  }
  clearCart() {
    this.cartItems = [];
  }
  totalQuantity(): number {
    return this.cartItems.reduce((s, c) => s + c.qty, 0);
  }
  subtotal(): number {
    return this.cartItems.reduce(
      (s, c) => s + c.qty * (c.product.price || 0),
      0
    );
  }
  total(): number {
    return this.subtotal();
  }

  checkout() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }
    this.showConfirmPopup = true;
  }
  closeConfirm() {
    this.showConfirmPopup = false;
  }

  confirmCheckout() {
    alert('Order confirmed');
    this.clearCart();
    this.showConfirmPopup = false;
    this.showCart = false;
  }

  printReceipt() {
    let receiptText = `
          RECEIPT
--------------------------------------------
No   Product Name     Qty     Price
--------------------------------------------
`;

    let total = 0;
    this.cartItems.forEach((ci, index) => {
      let name = ci.product.productName || '';

      // Truncate name to max 15 chars for receipt
      if (name.length > 15) {
        name = name.substring(0, 12) + '...'; // 12 + 3 dots = 15
      }

      const qty = ci.qty;
      const price = ci.product.price || 0;
      total += qty * price;

      // Pad the name to 15 characters for alignment
      receiptText += `${(index + 1).toString().padEnd(3)} ${name.padEnd(
        15
      )} ${qty.toString().padStart(3)}    $${price.toFixed(2).padStart(6)}\n`;
    });

    receiptText += `--------------------------------------------
Total: $${total.toFixed(2)}
--------------------------------------------`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    const iwin = iframe.contentWindow;
    if (!iwin) {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      alert('Printing not available. Please try allowing popups.');
      return;
    }

    iwin.document.open();
    iwin.document.write(`<pre>${receiptText}</pre>`);
    iwin.document.close();

    setTimeout(() => {
      try {
        iwin.focus();
        iwin.print();
      } catch (e) {
        alert('Automatic printing failed. Please print manually.');
      } finally {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }
    }, 200);
  }
}
