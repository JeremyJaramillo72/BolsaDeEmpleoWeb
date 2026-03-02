import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <--- 1. AGREGAR ESTO
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; // nuevas
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // <--- 2. AGREGAR ESTO,
    provideAnimations(), // <-- AÑADIR
    provideToastr({      // <-- AÑADIR
      timeOut: 5000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true
    })

  ]
};
