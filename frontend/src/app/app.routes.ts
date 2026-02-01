import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login';
import { MenuprincipalComponent } from './components/menu-principal/menuprincipal';
import { PerfilProfesionalComponent } from './components/perfil-profesional/perfil-profesional'; // 👈 Importante
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },
  {
    path: 'menu-principal',
    component: MenuprincipalComponent,
    canActivate: [AuthGuard],
    children: [ // 👈 Definimos los componentes que se verán "adentro"
      { path: 'perfil-profesional', component: PerfilProfesionalComponent },
      // Aquí puedes agregar más rutas hijas como 'busqueda-empleos', etc.
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
