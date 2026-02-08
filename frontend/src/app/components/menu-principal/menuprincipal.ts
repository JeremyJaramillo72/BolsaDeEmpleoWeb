import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router'; // 👈 Agregamos NavigationEnd
import { filter } from 'rxjs/operators';

interface MenuItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  roles?: string[];
  path?: string;
}

interface StatCard {
  label: string;
  value: number;
  color: string;
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

  // Variable para controlar la visibilidad de las tarjetas
  dashboardHomeVisible: boolean = true;

  menuItems: MenuItem[] = [];
  statsCards: StatCard[] = [];

  constructor(public router: Router) {
    // ✨ ESCUCHA DE RUTAS: Detecta cambios de URL sin recargar la página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.verificarRutaActual();
    });
  }

  ngOnInit(): void {
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.rolUsuario = localStorage.getItem('rol') || '';

    if (!localStorage.getItem('idUsuario')) {
      this.logout();
      return;
    }

    this.verificarRutaActual(); // Verificación inicial al cargar el componente
    this.inicializarMenuPorRol();
  }

  // Método centralizado para validar si estamos en el "Home" del panel
  private verificarRutaActual(): void {
    this.dashboardHomeVisible = this.router.url === '/menu-principal';
  }

  // Esta función es la que usarás en el *ngIf de tu HTML
  isDashboardHome(): boolean {
    return this.dashboardHomeVisible;
  }

  inicializarMenuPorRol(): void {
    const todasLasOpciones: MenuItem[] = [
      {
        icon: 'business',
        title: 'Gestión de Perfil Empresarial',
        description: 'Administra la información de tu empresa',
        color: 'from-blue-500 to-blue-600',
        roles: ['EMPRESA'],
        path: '/empresa/perfil'
      },
      {
        icon: 'person',
        title: 'Mi Perfil Profesional',
        description: 'Gestiona tu hoja de vida y datos',
        color: 'from-blue-500 to-blue-600',
        roles: ['POSTULANTE'],
        path: '/perfil-profesional'
      },
      {
        icon: 'work',
        title: 'Gestión de Ofertas Laborales',
        description: 'Crea y administra tus ofertas de empleo',
        color: 'from-cyan-500 to-cyan-600',
        roles: ['EMPRESA'],
        path: '/gestion-ofertas'
      },
      {
        icon: 'search',
        title: 'Búsqueda de Empleos',
        description: 'Encuentra vacantes disponibles',
        color: 'from-cyan-500 to-cyan-600',
        roles: ['POSTULANTE']
      },
      {
        icon: 'groups',
        title: 'Revisión de Postulaciones',
        description: 'Revisa los candidatos postulados',
        color: 'from-teal-500 to-teal-600',
        roles: ['EMPRESA']
      },
      {
        icon: 'assignment',
        title: 'Mis Postulaciones',
        description: 'Revisa el estado de tus aplicaciones',
        color: 'from-teal-500 to-teal-600',
        roles: ['POSTULANTE']
      },
      {
        icon: 'notifications',
        title: 'Notificaciones',
        description: 'Revisa tus notificaciones y alertas',
        color: 'from-purple-500 to-purple-600',
        roles: ['EMPRESA', 'POSTULANTE']
      },

      {
        icon: 'admin_panel_settings',
        title: 'Gestión de Usuarios',
        description: 'Control de empresas y graduados',
        color: 'from-red-500 to-red-600',
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/GestionUser'
      },
      {
        icon: 'settings_suggest',
        title: 'Gestión de Catálogos',
        description: 'Gestión de habilidades, carreras y tipos de contrato',
        color: 'from-emerald-500 to-green-600', // o 'from-indigo-500 to-indigo-600'
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/GestionCatalogos'
      },
      {
        icon: 'fact_check',
        title: 'Validación de Ofertas',
        description: 'Aprueba o rechaza nuevas vacantes',
        color: 'from-orange-500 to-orange-600',
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/ValidarOfertas'
      },
      {
        icon: 'manage_accounts', // o 'admin_panel_settings' o supervisor_account
        title: 'Gestión de Administradores',
        description: 'Crear y gestionar administradores secundarios',
        color: 'from-green-500 to-indigo-600',
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/admin-MiniAdmi'
      },
      {
        icon: 'bar_chart',
        title: 'Reportes y Estadísticas',
        description: 'Métricas y análisis del sistema',
        color: 'from-green-500 to-blue-600',
        roles: ['ADMINISTRADOR'],
        path: '/PanelAdmi/reports'
      }


    ];

    this.menuItems = todasLasOpciones.filter(item =>
      item.roles?.includes(this.rolUsuario)
    );

    if (this.rolUsuario === 'EMPRESA') {
      this.statsCards = [
        { label: 'Ofertas Activas', value: 12, color: 'from-blue-500 to-blue-600' },
        { label: 'Postulaciones', value: 48, color: 'from-cyan-500 to-cyan-600' },
        { label: 'En Revisión', value: 23, color: 'from-teal-500 to-teal-600' },
        { label: 'Notificaciones', value: 5, color: 'from-purple-500 to-purple-600' }
      ];
    } else if (this.rolUsuario === 'POSTULANTE') {
      this.statsCards = [
        { label: 'Mis Postulaciones', value: 5, color: 'from-teal-500 to-teal-600' },
        { label: 'En Proceso', value: 2, color: 'from-cyan-500 to-cyan-600' },
        { label: 'Ofertas Guardadas', value: 10, color: 'from-blue-500 to-blue-600' },
        { label: 'Alertas', value: 3, color: 'from-purple-500 to-purple-600' }
      ];
    }
    else if (this.rolUsuario === 'ADMINISTRADOR') {
      this.statsCards = [
        { label: 'Ofertas Pendientes', value: 8, color: 'from-orange-500 to-orange-600' },
        { label: 'Empresas Nuevas', value: 3, color: 'from-blue-500 to-blue-600' },
        { label: 'Usuarios Totales', value: 150, color: 'from-teal-500 to-teal-600' },
        { label: 'Reportes Hoy', value: 12, color: 'from-red-500 to-red-600' }
      ];
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.path) {
      // Navegación a la ruta hija configurada
      this.router.navigate(['/menu-principal' + item.path]);
    }
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
