import { HttpInterceptorFn } from '@angular/common/http';
import { BACKEND_ORIGIN, USE_LOCAL_BACKEND } from '../config/api-base';

const LOCAL_BACKEND = 'http://localhost:8080';

export const backendUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo reescribe localhost→Azure si NO estás en modo backend local explícito
  if (USE_LOCAL_BACKEND || !req.url.startsWith(LOCAL_BACKEND)) {
    return next(req);
  }

  const rewrittenUrl = req.url.replace(LOCAL_BACKEND, BACKEND_ORIGIN);
  return next(req.clone({ url: rewrittenUrl }));
};
