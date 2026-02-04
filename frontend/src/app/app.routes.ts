import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login';
import { MenuprincipalComponent } from './components/menu-principal/menuprincipal';
import { PerfilProfesionalComponent } from './components/perfil-profesional/perfil-profesional';
import { AuthGuard } from './guards/auth-guard';
import { PerfilEmpresaComponent } from './components/perfil-empresa/perfil-empresa';
import { GestionOfertasComponent } from './components/gestion-ofertas/gestion-ofertas';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },
  {
    path: 'menu-principal',
    component: MenuprincipalComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'perfil-profesional', component: PerfilProfesionalComponent },
      { path: 'empresa/perfil', component: PerfilEmpresaComponent },

      { path: 'gestion-ofertas', component: GestionOfertasComponent },
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
