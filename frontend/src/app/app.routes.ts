import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";
import { RegistroEmpresaComponent } from './components/registro-empresa/registro-empresa';
import { LoginComponent } from './components/login/login';
import { MenuprincipalComponent } from './components/menu-principal/menuprincipal';
import { PerfilProfesionalComponent } from './components/perfil-profesional/perfil-profesional';
import { AuthGuard } from './guards/auth-guard';
import { PerfilEmpresaComponent } from './components/perfil-empresa/perfil-empresa';
import { GestionOfertasComponent } from './components/gestion-ofertas/gestion-ofertas';
import { AdminValidarComponent} from './components/Panel-Admin/components/admin-validar/admin-validar';
import { AdminUsuariosComponent} from './components/Panel-Admin/components/auditorias-users/auditorias-users'
import {AdminMiniAdmiComponent} from './components/Panel-Admin/components/admin-mini-admi/admin-mini-admi';
import {GestionCatalogosComponent} from './components/Panel-Admin/components/gestion-catalogos/gestion-catalogos';
import {GestionReportesComponent} from './components/Panel-Admin/components/gestion-reportes/gestion-reportes';
import { ReporteEmpresaComponent} from './components/Reporte-Empresa/Reporte-Empresa';
import {ValidarEmpresaComponent} from './components/Panel-Admin/components/validar-empresa/validar-empresa';
import {RevisionPostulantesComponent} from './components/revision-postulantes/revision-postulantes';
import {RolesBdComponent} from './components/Panel-Admin/components/roles-bd/roles-bd';

import { BusquedaEmpleoComponent } from './components/busqueda-empleo/busqueda-empleo';
import { MisPostulacionesComponent } from './components/mis-postulaciones/mis-postulaciones';
import {ListaPostulantesComponent} from './components/revision-postulantes/lista-postulantes/lista-postulantes';
import {PerfilCandidatoComponent} from './components/revision-postulantes/perfil-candidato/perfil-candidato';
import {RegistroOfertasAdministradorComponent} from './components/Panel-Admin/components/gestion-ofertas-administrador/gestion-ofertas-administrador';

// (Asegúrate de importar tus 3 nuevos componentes arriba)
import { DashboardAdminComponent } from './components/menu-principal/dashboard-admin/dashboard-admin.component';
import { DashboardEmpresaComponent } from './components/menu-principal/dashboard-empresa/dashboard-empresa.component';
import { DashboardPostulanteComponent } from './components/menu-principal/dashboard-postulante/dashboard-postulante.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { ConfiguracionSistemaComponent } from './components/Panel-Admin/components/configuracion-sistema/configuracion-sistema';

import {UsuariosComponent} from './components/Panel-Admin/components/usuarios/usuarios';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: 'registro-empresa', component: RegistroEmpresaComponent },
  {
    path: 'menu-principal',
    component: MenuprincipalComponent,
    canActivate: [AuthGuard],
    children: [
      // 1. LAS 3 RUTAS DE LOS DASHBOARDS:
      { path: 'dashboard-admin', component: DashboardAdminComponent },
      { path: 'dashboard-empresa', component: DashboardEmpresaComponent },
      { path: 'dashboard-postulante', component: DashboardPostulanteComponent },


      { path: 'perfil-profesional', component: PerfilProfesionalComponent },
      { path: 'empresa/perfil', component: PerfilEmpresaComponent },
      { path: 'gestion-ofertas', component: GestionOfertasComponent },
      { path: 'PanelAdmi/ValidarOfertas', component: AdminValidarComponent },
      { path: 'PanelAuditorias/auditorias-users', component: AdminUsuariosComponent },
      { path: 'PanelAdmi/admin-MiniAdmi', component: AdminMiniAdmiComponent },
      {path: 'revision-postulantes', component: RevisionPostulantesComponent},
      { path: 'oferta/:idOferta/candidatos', component: ListaPostulantesComponent },
      { path: 'postulacion/:idPostulacion/perfil', component: PerfilCandidatoComponent },
      {
        path: 'PanelAdmi/GestionCatalogos',
        component: GestionCatalogosComponent
      },
      {
        path: 'PanelAdmi/GestionReportes',
        component: GestionReportesComponent
      },

      {
        path: 'Reporte-Empresa',
        component: ReporteEmpresaComponent
      },
      {
        path:  'PanelAdmi/RegistroOfertas',
        component: RegistroOfertasAdministradorComponent
      },

      {
        path: 'PanelAdmi/ValidarEmpresa',
        component: ValidarEmpresaComponent
      },
      {   path: 'busqueda-empleo', component: BusquedaEmpleoComponent },
      {   path: 'mis-postulaciones', component: MisPostulacionesComponent },
      {   path: 'GestionRolesbd', component: RolesBdComponent },
      {   path: 'Busqueda/empleo', component: BusquedaEmpleoComponent },
      {   path: 'postulacion/empleo', component: MisPostulacionesComponent },
      {   path: 'notificaciones', component: NotificacionesComponent },
      {   path: 'configuracion-sistema', component: ConfiguracionSistemaComponent },
      {   path: 'gestion/users', component: UsuariosComponent }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
