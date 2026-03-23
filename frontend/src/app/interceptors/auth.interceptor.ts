import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
    return next(req);
  }

  const adminStored = localStorage.getItem('adminUser');
  const supportStored = localStorage.getItem('supportAgent');

  let stored = null;
  // If request is for admin operations, use admin token
  if (req.url.includes('/dashboard')) {
    stored = adminStored;
  } 
  // If request is for tickets or support, use support token
  else if (req.url.includes('/tickets') || req.url.includes('/support')) {
    stored = supportStored || adminStored; // Fallback to admin if no support token
  } 
  else {
    stored = adminStored || supportStored;
  }

  if (!stored) {
    return next(req);
  }

  try {
    const parsed = JSON.parse(stored);

    if (parsed?.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${parsed.token}`
        }
      });
    }
  } catch {
    // ignore
  }

  return next(req);
};