import { HttpInterceptorFn } from '@angular/common/http';
import { BACKEND_ORIGIN } from '../config/api-base';

const LOCAL_BACKEND = 'http://localhost:8080';

export const backendUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(LOCAL_BACKEND)) {
    return next(req);
  }

  const rewrittenUrl = req.url.replace(LOCAL_BACKEND, BACKEND_ORIGIN);
  return next(req.clone({ url: rewrittenUrl }));
};
