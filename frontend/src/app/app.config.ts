import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { SocialAuthServiceConfig, GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';


import { dbErrorInterceptor } from '././components/Panel-Admin/components/configuracion-sistema/respaldos-bd/db-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(

      withInterceptors([dbErrorInterceptor, httpErrorInterceptor]),
      withInterceptorsFromDi()
    ),


    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

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
    }),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('209560450108-k8evvdh5l05tgjoiu3frtv5mch194mfa.apps.googleusercontent.com', {
              oneTapEnabled: false
            })
          }
        ],
        onError: (err: any) => {
          console.error('Error en el login de Google:', err);
        }
      } as SocialAuthServiceConfig
    },
    SocialAuthService
  ]
};
