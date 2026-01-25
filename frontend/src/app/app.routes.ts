import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login';
import {MenuprincipalComponent} from './components/menu-principal/menuprincipal';
import {AuthGuard} from './guards/auth-guard';

export const routes: Routes = [
  // 1. Ruta principal de acceso
  { path: 'login', component: LoginComponent },

  // 2. Rutas de registro
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },
  {
    path: 'menu-principal',
    component: MenuprincipalComponent,
    canActivate: [AuthGuard] // Solo verifica que esté logueado
  },
  /*{
    path: 'gestion-ofertas',
    //component: OfertasComponent,
    canActivate: [AuthGuard],
    data: { role: 'EMPRESA' } // <--- Aquí defines quién puede entrar
  },*/
  // 3. Redirección inicial: Si el usuario entra a http://localhost:4200/ lo manda al login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // 4. Comodín: Si escriben cualquier ruta inexistente, regresan al login por seguridad
  { path: '**', redirectTo: '/login' }
];
