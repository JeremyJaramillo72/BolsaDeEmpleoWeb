import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { UsuarioEmpresaService } from '../../services/usuario-empresa.service';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

import { NotificationService } from '../../services/notification.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
// 1. ACTUALIZAMOS LAS INTERFACES CON LOS NUEVOS CAMPOS VISUALES
export interface MenuItem {
  icon: string;
  title: string;
  description: string;
  color?: string; // (Mantenido por compatibilidad)
  colorHex?: string; // Nuevo: Color principal (Ej: #2563EB)
  bgHex?: string;    // Nuevo: Color de fondo suavizado (Ej: #EFF6FF)
  badge?: number | string; // Nuevo: Para mostrar notitas numéricas
  roles?: string[];
  path?: string;
  route?: string;    // Nuevo: Ruta completa para el routerLink
  permiso?: string;
}

export interface StatCard {
  label: string;
  value: number;
  color: string; // (Mantenido por compatibilidad)
  colorHex?: string; // Nuevo: Color hexadecimal
  icon?: string;     // Nuevo: Icono de Material Design
  roles?: string[];
}

@Component({
  selector: 'app-menuprincipal',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './menuprincipal.html',
  styleUrls: ['./menuprincipal.css']
})
export class MenuprincipalComponent implements OnInit {
  isSidebarOpen: boolean = true;
  nombreUsuario: string = '';
  rolUsuario: string = '';
  fotoMenu: string = '';

 // dashboardHomeVisible: boolean = true;
  isDarkMode: boolean = false;

  menuItems: MenuItem[] = [];
 // statsCards: StatCard[] = [];

  constructor(
    public router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private usuarioEmpresaService: UsuarioEmpresaService,
    public notificationService: NotificationService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRutaActual();
      });
  }

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.rolUsuario = localStorage.getItem('rol') || '';

    if (!localStorage.getItem('idUsuario')) {
      this.cerrarSesion();
      return;
    }

    this.usuarioEmpresaService.logoActual$.subscribe(nuevaUrl => {
      if (nuevaUrl) {
        this.fotoMenu = nuevaUrl;
        this.cdr.detectChanges();
      }
    });

    this.verificarRutaActual();
    this.inicializarMenuPorRol();

    if (this.router.url === '/menu-principal' || this.router.url === '/menu-principal/') {
      this.irAInicio();
    }
    this.notificationService.notificaciones$.subscribe(() => {
      this.actualizarKPIsNotificaciones();
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  private verificarRutaActual(): void {

    /* const urlActual = this.router.url.split('?')[0];
    this.dashboardHomeVisible = (urlActual === '/menu-principal' || urlActual === '/menu-principal/');
    this.cdr.detectChanges();
     */

  }

/*
  isDashboardHome(): boolean {
    return this.dashboardHomeVisible;
  }
 */

  private actualizarKPIsNotificaciones() {
    /* Actualiza la tarjetita de arriba con el número real de notificaciones
    const statNotif = this.statsCards.find(stat => stat.icon === 'notifications');
    if (statNotif) {
      statNotif.value = this.notificationService.cantidadSinLeer;
      this.cdr.detectChanges();
    }

     */
  }

  inicializarMenuPorRol(): void {
    // 2. ASIGNAMOS LOS COLORES MODERNOS DEL DISEÑO DE FIGMA
    const todasLasOpciones: MenuItem[] = [
      // --- MÓDULOS DE EMPRESA ---
      {
        icon: 'business',
        title: 'Gestión de Perfil Empresarial',
        description: 'Administra la información de tu empresa',
        colorHex: '#2563EB', bgHex: '#EFF6FF',
        roles: ['EMPRESA'],
        path: '/empresa/perfil',
        route: '/menu-principal/empresa/perfil',
        permiso: 'PERFIL_EMP'
      },
      {
        icon: 'work',
        title: 'Gestión de Ofertas Laborales',
        description: 'Crea y administra tus ofertas de empleo',
        colorHex: '#0891b2', bgHex: '#ecfeff',
        roles: ['EMPRESA'],
        path: '/gestion-ofertas',
        route: '/menu-principal/gestion-ofertas',
        permiso: 'OFERTAS_EMP'
      },
      {
        icon: 'groups',
        title: 'Revisión de Postulaciones',
        description: 'Revisa los candidatos postulados',
        colorHex: '#10b981', bgHex: '#ecfdf5',
        roles: ['EMPRESA'],
        path: '/revision-postulantes',
        route: '/menu-principal/revision-postulantes',
        permiso: 'POSTULANTES_EMP'
      },
      {
        icon: 'work',
        title: 'Reportes de Empresa',
        description: 'Métricas y análisis del sistema',
        colorHex: '#059669', bgHex: '#ecfdf5',
        roles: ['EMPRESA'],
        path: 'Reportes-Empresa',
        route: '/menu-principal/Reporte-Empresa',
        permiso: 'REPORTES_EMP'
      },


      // --- MÓDULOS DE POSTULANTE ---
      {
        icon: 'person',
        title: 'Mi Perfil Profesional',
        description: 'Gestiona tu hoja de vida y datos',
        colorHex: '#2563EB', bgHex: '#EFF6FF',
        roles: ['POSTULANTE'],
        path: '/perfil-profesional',
        route: '/menu-principal/perfil-profesional',
        permiso: 'PERFIL_POS'
      },
      {
        icon: 'search',
        title: 'Búsqueda de Empleos',
        description: 'Encuentra vacantes disponibles',
        colorHex: '#0891b2', bgHex: '#ecfeff',
        roles: ['POSTULANTE', 'SUPERVISOR'],
        path: '/Busqueda/empleo',
        route: '/menu-principal/busqueda-empleo',
        permiso: 'BUSQUEDA_POS'
      },
      {
        icon: 'assignment',
        title: 'Mis Postulaciones',
        description: 'Revisa el estado de tus aplicaciones',
        colorHex: '#10b981', bgHex: '#ecfdf5',
        roles: ['POSTULANTE'],
        path: '/postulacion/empleo',
        route: '/menu-principal/mis-postulaciones',
        permiso: 'POSTULACIONES_POS'
      },

      // --- COMPARTIDO ---
      {
        icon: 'notifications',
        title: 'Notificaciones',
        description: 'Revisa tus notificaciones y alertas',
        colorHex: '#8b5cf6', bgHex: '#f5f3ff',
        roles: ['EMPRESA', 'POSTULANTE'],
        path: '/notificaciones',
        route: '/menu-principal/notificaciones',
        permiso: 'NOTIFICACIONES'
      },

      // --- MÓDULOS DE ADMINISTRADOR ---
      {
        icon: 'admin_panel_settings',
        title: 'Auditorias',
        description: 'Control de empresas y graduados',
        colorHex: '#2563EB', bgHex: '#EFF6FF', badge: 4,
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAuditorias/auditorias-users',
        route: '/menu-principal/PanelAuditorias/auditorias-users',
        permiso: 'USERS'
      },
      {
        icon: 'settings_suggest',
        title: 'Gestión de Catálogos',
        description: 'Gestión de habilidades, carreras y contratos',
        colorHex: '#0891b2', bgHex: '#ecfeff',
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAdmi/GestionCatalogos',
        route: '/menu-principal/PanelAdmi/GestionCatalogos',
        permiso: 'CATALOGOS'
      },
      {
        icon: 'note_add',
        title: 'Registro de Ofertas',
        description: 'Registrar ofertas físicas enviadas por empresas',
        colorHex: '#ea580c', bgHex: '#fff7ed',
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAdmi/RegistroOfertas',
        route: '/menu-principal/PanelAdmi/RegistroOfertas',
        permiso: 'REGISTRO_OFERTAS'
      },
      {
        icon: 'fact_check',
        title: 'Validación de Ofertas',
        description: 'Aprueba o rechaza nuevas vacantes',
        colorHex: '#d97706', bgHex: '#fffbeb', badge: 3,
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAdmi/ValidarOfertas',
        route: '/menu-principal/PanelAdmi/ValidarOfertas',
        permiso: 'VALIDACION_O'
      },
      {
        icon: 'manage_accounts',
        title: 'Gestión Administradores',
        description: 'Crear y gestionar administradores secundarios',
        colorHex: '#7c3aed', bgHex: '#f5f3ff',
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/admin-MiniAdmi',
        route: '/menu-principal/PanelAdmi/admin-MiniAdmi',
        permiso: 'GESTION_ADMINS'
      },
      {
        icon: 'bar_chart',
        title: 'Reportes y Estadísticas',
        description: 'Métricas y análisis del sistema',
        colorHex: '#059669', bgHex: '#ecfdf5',
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAdmi/GestionReportes',
        route: '/menu-principal/PanelAdmi/GestionReportes',
        permiso: 'REPORTES'
      },
      {
        icon: 'domain_verification',
        title: 'Validación Empresas',
        description: 'Valida y gestiona las Empresas registradas',
        colorHex: '#dc2626', bgHex: '#fff1f2', badge: 2,
        roles: ['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'],
        path: '/PanelAdmi/ValidarEmpresa',
        route: '/menu-principal/PanelAdmi/ValidarEmpresa',
        permiso: 'VALIDACION_E'
      },
      {
        icon: 'settings',
        title: 'Gestión Roles BD',
        description: 'Crea y gestiona tus Roles de Base de Dato',
        colorHex: '#0f172a', bgHex: '#f1f5f9',
        roles: ['ADMINISTRADOR'],
        path: '/GestionRolesbd',
        route: '/menu-principal/GestionRolesbd',
        permiso: 'ROLES_BD'
      },
      {
        icon: 'settings_backup_restore',
        title: 'Configuración del Sistema',
        description: 'Gestiona configuración de correo, plantillas y más',
        colorHex: '#7c3aed', bgHex: '#f5f3ff',
        roles: ['ADMINISTRADOR'],
        path: '/configuracion-sistema',
        route: '/menu-principal/configuracion-sistema',
        permiso: 'CONFIG_SISTEMA'
      }
    ];

    this.menuItems = todasLasOpciones.filter(item => {

      // 1. Usuarios Base (No usan permisos dinámicos, entran por su rol puro)
      if (this.rolUsuario === 'EMPRESA' || this.rolUsuario === 'POSTULANTE') {
        return item.roles?.includes(this.rolUsuario);
      }

      // 2. Administrador Maestro (Entra a todo lo que sea de Admin, sin restricciones)
      if (this.rolUsuario === 'ADMINISTRADOR') {
        return item.roles?.includes(this.rolUsuario);
      }

      // 3. ROLES DINÁMICOS (Supervisor, Gerente, Nuevo Rol... ¡AQUÍ MANDA EL PERMISO!)
      if (item.permiso) {
        return this.authService.tienePermiso(item.permiso);
      }

      // 4. Si es un módulo compartido sin permiso específico (Ej: Notificaciones)
      return item.roles?.includes(this.rolUsuario);

    });
    this.cdr.detectChanges();
    /*// 3. ACTUALIZAMOS LOS KPIs SUPERIORES CON SUS ICONOS Y COLORES
    if (this.rolUsuario === 'EMPRESA') {
      this.statsCards = [
        { label: 'Ofertas Activas', value: 12, color: '', colorHex: '#2563EB', icon: 'work' },
        { label: 'Postulaciones', value: 48, color: '', colorHex: '#0891b2', icon: 'groups' },
        { label: 'En Revisión', value: 23, color: '', colorHex: '#10b981', icon: 'pending_actions' },
        { label: 'Notificaciones', value: 5, color: '', colorHex: '#8b5cf6', icon: 'notifications' }
      ];
    } else if (this.rolUsuario === 'POSTULANTE') {
      this.statsCards = [
        { label: 'Mis Postulaciones', value: 5, color: '', colorHex: '#2563EB', icon: 'assignment' },
        { label: 'En Proceso', value: 2, color: '', colorHex: '#0891b2', icon: 'schedule' },
        { label: 'Ofertas Guardadas', value: 10, color: '', colorHex: '#10b981', icon: 'bookmark' },
        { label: 'Alertas', value: 3, color: '', colorHex: '#8b5cf6', icon: 'notifications' }
      ];
    } else if (this.rolUsuario === 'ADMINISTRADOR') {
      this.statsCards = [
        { label: 'Ofertas Pendientes', value: 8, color: '', colorHex: '#0f172a', icon: 'error_outline' },
        { label: 'Empresas Nuevas', value: 3, color: '', colorHex: '#2563EB', icon: 'business' },
        { label: 'Usuarios Totales', value: 150, color: '', colorHex: '#10b981', icon: 'groups' },
        { label: 'Reportes Hoy', value: 12, color: '', colorHex: '#0f172a', icon: 'trending_up' }
      ];
    }

     */


    this.cdr.detectChanges();

  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.path) {
      this.router.navigateByUrl('/menu-principal' + item.path);
    }
  }

  cerrarSesion() {
    this.notificationService.desconectar(); // cerrando ws
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        sessionStorage.clear();
        console.log("⏪ Conexión de BD reseteada al default y sesión cerrada");
        window.location.href = '/login';
      },
      error: (err) => {
        console.error("Error al cerrar sesión en el servidor", err);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      }
    });
  }

  irAInicio(): void {
    const rol = this.rolUsuario.toUpperCase();

    // Si tienes un rol dinámico con permisos de Admin, o eres Admin
    if (this.authService.tienePermiso('REPORTES') || this.authService.tienePermiso('USERS') || ['ADMINISTRADOR', 'GERENTE', 'SUPERVISOR'].includes(rol)) {
      this.router.navigate(['/menu-principal/dashboard-admin']);
    }
    else if (rol === 'EMPRESA') {
      this.router.navigate(['/menu-principal/dashboard-empresa']);
    }
    else {
      this.router.navigate(['/menu-principal/dashboard-postulante']);
    }
  }
}
