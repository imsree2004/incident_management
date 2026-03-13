import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const stored = localStorage.getItem('supportAgent');

  if (!stored || req.url.includes('/support/auth/')) {
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
    localStorage.removeItem('supportAgent');
  }

  return next(req);
};