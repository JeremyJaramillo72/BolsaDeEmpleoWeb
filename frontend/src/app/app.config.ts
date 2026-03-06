import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut: 4500,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      newestOnTop: false,
      maxOpened: 6,
      progressAnimation: 'decreasing',
      closeButton: true
    })
  ]
};
