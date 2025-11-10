// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   // const router = inject(Router);

//   // if (typeof window !== 'undefined') {
//   //   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
//   //   return isLoggedIn ? true : router.createUrlTree(['/login']);
//   // }
//   // return router.createUrlTree(['/login']);

//   const router = inject(Router);

//   if (typeof window === 'undefined') {
//     return router.createUrlTree(['/login']);
//   }

//   const token = localStorage.getItem('auth_token');
//   // quick check: token exists
//   if (token) {
//     return true;
//   }

//   // otherwise redirect to login (optionally include returnUrl)
//   return router.createUrlTree(['/login'], {
//     queryParams: { returnUrl: state.url },
//   });
// };

// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    // Basic beginner-friendly auth: read user from localStorage
    const raw = localStorage.getItem('current_user');
    const user = raw ? JSON.parse(raw) : null;

    // Not logged in -> redirect to login
    if (!user) {
      return this.router.parseUrl('/login');
    }

    // If route requires a role, check it
    const requiredRole = route.data?.['role'] as string | undefined;
    if (requiredRole) {
      const userRole = (user.role || '').toString().toLowerCase();
      if (userRole !== requiredRole.toLowerCase()) {
        // If a normal user attempted to open an admin page -> send to store
        if (userRole === 'user') {
          return this.router.parseUrl('/store');
        }
        // Otherwise send to login (fallback)
        return this.router.parseUrl('/login');
      }
    }

    // allowed
    return true;
  }
}
