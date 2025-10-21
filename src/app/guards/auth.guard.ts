import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // const router = inject(Router);

  // if (typeof window !== 'undefined') {
  //   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  //   return isLoggedIn ? true : router.createUrlTree(['/login']);
  // }
  // return router.createUrlTree(['/login']);

  const router = inject(Router);

  if (typeof window === 'undefined') {
    return router.createUrlTree(['/login']);
  }

  const token = localStorage.getItem('auth_token');
  // quick check: token exists
  if (token) {
    return true;
  }

  // otherwise redirect to login (optionally include returnUrl)
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
