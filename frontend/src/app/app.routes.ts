import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login'; //

export const routes: Routes = [
  // 1. Ruta principal de acceso
  { path: 'login', component: LoginComponent },

  // 2. Rutas de registro
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },

  // 3. Redirección inicial: Si el usuario entra a http://localhost:4200/ lo manda al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 4. Comodín: Si escriben cualquier ruta inexistente, regresan al login por seguridad
  { path: '**', redirectTo: '/login' }
];
