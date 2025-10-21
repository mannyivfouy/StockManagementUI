import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/api/user.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  pageTitle = 'Dashboard';

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
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.imageUrl) {
        this.userImage = parsedUser.imageUrl;
      }
    }
  }
}
