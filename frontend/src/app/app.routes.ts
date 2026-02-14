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
import { AdminUsuariosComponent} from './components/Panel-Admin/components/auditorias-users/auditorias-users'
import {AdminMiniAdmiComponent} from './components/Panel-Admin/components/admin-mini-admi/admin-mini-admi';
import  {GestionCatalogosComponent} from './components/Panel-Admin/components/gestion-catalogos/gestion-catalogos';
import {GestionReportesComponent} from './components/Panel-Admin/components/gestion-reportes/gestion-reportes';

import {ValidarEmpresaComponent} from './components/Panel-Admin/components/validar-empresa/validar-empresa';

import { BusquedaEmpleoComponent } from './components/busqueda-empleo/busqueda-empleo';
import { MisPostulacionesComponent } from './components/mis-postulaciones/mis-postulaciones';

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
      { path: 'PanelAuditorias/auditorias-users', component: AdminUsuariosComponent },
      { path: 'PanelAdmi/admin-MiniAdmi', component: AdminMiniAdmiComponent },
      {
        path: 'PanelAdmi/GestionCatalogos',
        component: GestionCatalogosComponent
      },
      {
        path: 'PanelAdmi/GestionReportes',
        component: GestionReportesComponent
      },
      {
        path: 'PanelAdmi/ValidarEmpresa',
        component: ValidarEmpresaComponent
      },
      {   path: 'busqueda-empleo', component: PerfilProfesionalComponent },
      {   path: 'mis-postulaciones', component: PerfilProfesionalComponent }

    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
