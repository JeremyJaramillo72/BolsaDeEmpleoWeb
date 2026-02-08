import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login';
import { MenuprincipalComponent } from './components/menu-principal/menuprincipal';
import { PerfilProfesionalComponent } from './components/perfil-profesional/perfil-profesional';
import { AuthGuard } from './guards/auth-guard';
import { PerfilEmpresaComponent } from './components/perfil-empresa/perfil-empresa';
import { GestionOfertasComponent } from './components/gestion-ofertas/gestion-ofertas';
import { AdminValidarOfertasComponent} from './components/Panel-Admin/components/admin-validar/admin-validar';
import { AdminGestionUsuariosComponent} from './components/Panel-Admin/components/admin-usuarios/admin-usuarios'
import {AdminMiniAdmiComponent} from './components/Panel-Admin/components/admin-mini-admi/admin-mini-admi';

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
      { path: 'PanelAdmi/ValidarOfertas', component: AdminValidarOfertasComponent },
      { path: 'PanelAdmi/GestionUser', component: AdminGestionUsuariosComponent },
      { path: 'PanelAdmi/admin-MiniAdmi', component: AdminMiniAdmiComponent }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
