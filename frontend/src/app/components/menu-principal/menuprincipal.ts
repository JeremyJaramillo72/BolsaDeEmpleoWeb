import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { UsuarioEmpresaService } from '../../services/usuario-empresa.service';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

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
  imports: [CommonModule, RouterModule],
  templateUrl: './menuprincipal.html',
  styleUrls: ['./menuprincipal.css']
})
export class MenuprincipalComponent implements OnInit {
  isSidebarOpen: boolean = true;
  nombreUsuario: string = '';
  rolUsuario: string = '';
  fotoMenu: string = '';

  dashboardHomeVisible: boolean = true;

  menuItems: MenuItem[] = [];
  statsCards: StatCard[] = [];

  constructor(
    public router: Router,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private usuarioEmpresaService: UsuarioEmpresaService
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
  }

  private verificarRutaActual(): void {
    const urlActual = this.router.url.split('?')[0];
    this.dashboardHomeVisible = (urlActual === '/menu-principal' || urlActual === '/menu-principal/');
    this.cdr.detectChanges();
  }

  isDashboardHome(): boolean {
    return this.dashboardHomeVisible;
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
        route: '/menu-principal/empresa/perfil'
      },
      {
        icon: 'work',
        title: 'Gestión de Ofertas Laborales',
        description: 'Crea y administra tus ofertas de empleo',
        colorHex: '#0891b2', bgHex: '#ecfeff',
        roles: ['EMPRESA'],
        path: '/gestion-ofertas',
        route: '/menu-principal/gestion-ofertas'
      },
      {
        icon: 'groups',
        title: 'Revisión de Postulaciones',
        description: 'Revisa los candidatos postulados',
        colorHex: '#10b981', bgHex: '#ecfdf5',
        roles: ['EMPRESA'],
        path: '/revision-postulantes',
        route: '/menu-principal/revision-postulantes'
      },

      // --- MÓDULOS DE POSTULANTE ---
      {
        icon: 'person',
        title: 'Mi Perfil Profesional',
        description: 'Gestiona tu hoja de vida y datos',
        colorHex: '#2563EB', bgHex: '#EFF6FF',
        roles: ['POSTULANTE'],
        path: '/perfil-profesional',
        route: '/menu-principal/perfil-profesional'
      },
      {
        icon: 'search',
        title: 'Búsqueda de Empleos',
        description: 'Encuentra vacantes disponibles',
        colorHex: '#0891b2', bgHex: '#ecfeff',
        roles: ['POSTULANTE'],
        path: '/busqueda-empleo',
        route: '/menu-principal/busqueda-empleo'
      },
      {
        icon: 'assignment',
        title: 'Mis Postulaciones',
        description: 'Revisa el estado de tus aplicaciones',
        colorHex: '#10b981', bgHex: '#ecfdf5',
        roles: ['POSTULANTE'],
        path: '/mis-postulaciones',
        route: '/menu-principal/mis-postulaciones'
      },

      // --- COMPARTIDO ---
      {
        icon: 'notifications',
        title: 'Notificaciones',
        description: 'Revisa tus notificaciones y alertas',
        colorHex: '#8b5cf6', bgHex: '#f5f3ff',
        roles: ['EMPRESA', 'POSTULANTE'],
        path: '/notificaciones',
        route: '/menu-principal/notificaciones'
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
        route: '/menu-principal/PanelAdmi/admin-MiniAdmi'
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
        route: '/menu-principal/GestionRolesbd'
      }
    ];

    this.menuItems = todasLasOpciones.filter(item => {
      const rolCoincide = item.roles?.includes(this.rolUsuario);
      if (rolCoincide && item.permiso) {
        return this.authService.tienePermiso(item.permiso);
      }
      return rolCoincide;
    });

    // 3. ACTUALIZAMOS LOS KPIs SUPERIORES CON SUS ICONOS Y COLORES
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
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.path) {
      this.dashboardHomeVisible = false;
      this.router.navigateByUrl('/menu-principal' + item.path).then(navegacionExitosa => {
        if (!navegacionExitosa) {
          this.verificarRutaActual();
        }
      });
    }
  }

  cerrarSesion() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/login']);
        console.log("⏪ Conexión de BD reseteada al default y sesión cerrada");
      },
      error: (err) => {
        console.error("Error al cerrar sesión en el servidor", err);
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
