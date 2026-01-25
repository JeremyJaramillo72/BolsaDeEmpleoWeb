import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface MenuItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  roles?: string[];
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
  imports: [CommonModule],
  templateUrl: './menuprincipal.html',
  styleUrls: ['./menuprincipal.css']
})
export class MenuprincipalComponent implements OnInit {
  isSidebarOpen: boolean = true;

  // Variables para la sesión
  nombreUsuario: string = '';
  rolUsuario: string = '';

  // Listas que se cargarán según el rol
  menuItems: MenuItem[] = [];
  statsCards: StatCard[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // 1. Recuperamos los datos que guardaste en el login
    this.nombreUsuario = localStorage.getItem('nombre') || 'Usuario';
    this.rolUsuario = localStorage.getItem('rol') || '';

    // 2. Verificación de seguridad básica: si no hay ID, no debería estar aquí
    if (!localStorage.getItem('idUsuario')) {
      this.logout();
      return;
    }

    // 3. Cargamos el contenido según el rol que detectamos
    this.inicializarMenuPorRol();
  }

  inicializarMenuPorRol(): void {
    // Definición maestra de todas las opciones del menú
    const todasLasOpciones: MenuItem[] = [
      {
        icon: 'business',
        title: 'Gestión de Perfil Empresarial',
        description: 'Administra la información de tu empresa',
        color: 'from-blue-500 to-blue-600',
        roles: ['EMPRESA']
      },
      {
        icon: 'person',
        title: 'Mi Perfil Profesional',
        description: 'Gestiona tu hoja de vida y datos',
        color: 'from-blue-500 to-blue-600',
        roles: ['POSTULANTE']
      },
      {
        icon: 'work',
        title: 'Gestión de Ofertas Laborales',
        description: 'Crea y administra tus ofertas de empleo',
        color: 'from-cyan-500 to-cyan-600',
        roles: ['EMPRESA']
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
        icon: 'verified',
        title: 'Validación de Credenciales',
        description: 'Valida la información de candidatos',
        color: 'from-indigo-500 to-indigo-600',
        roles: ['EMPRESA']
      },
      {
        icon: 'notifications',
        title: 'Notificaciones',
        description: 'Revisa tus notificaciones y alertas',
        color: 'from-purple-500 to-purple-600',
        roles: ['EMPRESA', 'POSTULANTE']
      }
    ];

    // Filtramos para que 'menuItems' solo tenga lo que el rol actual puede ver
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
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onMenuItemClick(item: MenuItem): void {
    console.log('Navegando a:', item.title);
    // Aquí irá la navegación cuando implementes las funcionalidades
  }

  logout(): void {
    console.log('Cerrando sesión...');
    // Limpieza total de seguridad para cumplir con los requisitos del proyecto
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
