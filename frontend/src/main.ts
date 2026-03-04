import { bootstrapApplication } from '@angular/platform-browser';
// Import compiler to enable JIT compilation for dynamic/lazy components during dev
import * as ngCompiler from '@angular/compiler';
(window as any).ngCompiler = ngCompiler; // ensure compiler is retained at runtime (dev only)
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
