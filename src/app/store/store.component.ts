import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { StoreService, Product, Category } from '../services/api/store.service';
import { ReportService } from '../services/api/report.service';

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

  // report state
  isSendingReports = false;

  constructor(
    private service: StoreService,
    private reportService: ReportService
  ) {}

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

  getProductImage(product: Product): string {
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

  private getLoggedInUser(): { userID: number; username: string } | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        if (u.userID && u.username) {
          return { userID: Number(u.userID), username: u.username };
        }
      } catch {}
    }

    const token =
      localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userID && payload.username) {
          return { userID: Number(payload.userID), username: payload.username };
        }
      } catch {}
    }

    return null;
  }

  async confirmCheckout() {
    if (!this.cartItems.length) return;

    const user = this.getLoggedInUser();
    if (!user) {
      alert('Please login before checkout.');
      return;
    }

    const items = this.cartItems.map((ci) => ({
      productID: Number(ci.product.productID),
      qty: Number(ci.qty),
    }));

    const payload = {
      userID: user.userID,
      username: user.username,
      purchase_date: new Date().toISOString(),
      items,
      totalAmount: this.total(),
    };

    try {
      this.isSendingReports = true;
      await firstValueFrom(this.service.createPurchase(payload));
      await firstValueFrom(this.reportService.createReport(payload));
      this.clearCart();
      this.showConfirmPopup = false;
      this.showCart = false;
      this.showToast('Purchase successful!');
    } catch (err) {
      console.error('Failed to create report', err);
      alert('Failed to record order. Please try again.');
    } finally {
      this.isSendingReports = false;
    }
  }

  // -----------------------------
  // Receipt
  // -----------------------------
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
      if (name.length > 15) name = name.substring(0, 12) + '...';
      const qty = ci.qty;
      const price = ci.product.price || 0;
      total += qty * price;
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

  // -----------------------------
  // Toast
  // -----------------------------
  private showToast(msg: string) {
    try {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position = 'fixed';
      el.style.bottom = '20px';
      el.style.right = '20px';
      el.style.background = 'rgba(0,0,0,0.8)';
      el.style.color = 'white';
      el.style.padding = '8px 12px';
      el.style.borderRadius = '6px';
      el.style.zIndex = '9999';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    } catch {
      alert(msg);
    }
  }
}
