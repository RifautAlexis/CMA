import { inject, InjectionToken } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const baseUrl = inject(API_BASE_URL);
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedUrl = req.url.replace(/^\/+/, '');

  return next(req.clone({ url: `${normalizedBaseUrl}/${normalizedUrl}` }));
};
