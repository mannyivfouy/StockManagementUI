import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/api/user.service';
import { User } from '../../services/api/user.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})

export class HeaderComponent {
  pageTitle = 'Dashboard';
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let currentRoute = this.route.firstChild;
          while (currentRoute?.firstChild)
            currentRoute = currentRoute.firstChild;
          return currentRoute;
        }),
        mergeMap((route) => route?.data ?? [])
      )
      .subscribe((data) => {
        this.pageTitle = data['title'] || '';
      });
  }

  userImage: string = '/assets/images/loginImg.jpg';

  ngOnInit() {
    // Subscribe to BehaviorSubject
    this.userService.currentUserSubject.subscribe((user) => {
      this.currentUser = user;
    });

    // If null, read from localStorage
    if (!this.currentUser) {
      const userStr = localStorage.getItem('current_user');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    }
  }
}
