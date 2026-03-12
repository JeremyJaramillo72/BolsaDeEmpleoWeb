import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { RolesBdFormComponent } from './roles-bd-form/roles-bd-form';

// Exportamos las interfaces para usarlas en el hijo
export interface Permiso {
  select: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
}

export interface Tabla {
  nombre: string;
  permisos: Permiso;
  mostrarPermisos: boolean;
}

export interface Esquema {
  nombre: string;
  usage: boolean;
  permisoGlobal: boolean;
  mostrarTablas: boolean;
  tablas: Tabla[];
}

export interface RolBase {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rolActual: string;
  seleccionado: boolean;
}

export interface RolCreado {
  id: string;
  nombre: string;
  rolBase: string;
  fechaCreacion: string;
  totalPermisos: number;
  usuariosAsignados: number;
}

@Component({
  selector: 'app-roles-bd',
  standalone: true,
  imports: [CommonModule, RolesBdFormComponent], // Importamos el componente hijo
  templateUrl: './roles-bd.html',
  styleUrls: ['./roles-bd.css']
})
export class RolesBdComponent implements OnInit {
  vistaActual: 'LISTA' | 'CREAR' | 'EDITAR' = 'LISTA';
  rolesCreados: RolCreado[] = [];
  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  rolEnEdicion: RolCreado | null = null;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.cargarRolesCreados();
  }

  cargarRolesCreados(): void {
    this.cargando = true;
    this.adminService.obtenerRolesBD().subscribe({
      next: (data) => {
        this.rolesCreados = data.map((rol: any) => ({
          id: String(rol.idRol),
          nombre: rol.nombreRol,
          rolBase: rol.rolBase || 'Ninguno',
          fechaCreacion: rol.fechaCreacion,
          totalPermisos: rol.totalPermisos || 0,
          usuariosAsignados: rol.usuariosAsignados || 0
        }));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles:', err);
        this.mostrarError('Error al cargar roles de BD');
        this.cargando = false;
      }
    });
  }

  irACrear(): void {
    this.rolEnEdicion = null;
    this.vistaActual = 'CREAR';
  }

  irALista(): void {
    this.vistaActual = 'LISTA';
    this.rolEnEdicion = null;
  }

  irAEditar(rol: RolCreado): void {
    this.rolEnEdicion = rol;
    this.vistaActual = 'EDITAR';
  }

  eliminarRol(rol: RolCreado): void {
    this.confirmService.abrir(`¿Está seguro de eliminar el rol "${rol.nombre}"? Los ${rol.usuariosAsignados} usuario(s) asignado(s) perderán este rol. Esta acción no se puede deshacer.`).then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarRolBD(rol.id).subscribe({
        next: () => {
          this.mostrarExito('Rol eliminado exitosamente');
          this.cargarRolesCreados();
        },
        error: (err) => {
          console.error('Error al eliminar rol:', err);
          this.mostrarError('Error al eliminar rol');
        }
      });
    });
  }

  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 4000);
  }

  // Método para reaccionar cuando el hijo termina de guardar exitosamente
  onRolGuardado(mensaje: string): void {
    this.mostrarExito(mensaje);
    this.cargarRolesCreados();
    this.irALista();
  }
}
