import { Component } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [SidebarComponent, HeaderComponent, RouterOutlet, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  pageOpacity = 1;
  pageScale = 1;

  onRouteChange() {
    // Start fade-out and slight shrink
    this.pageOpacity = 0;
    this.pageScale = 0.95;

    setTimeout(() => {
      // Fade-in and restore scale
      this.pageOpacity = 1;
      this.pageScale = 1;
    }, 300); // Delay matches the transition duration
  }
}
