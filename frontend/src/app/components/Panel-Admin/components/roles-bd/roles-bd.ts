import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

interface Permiso {
  select: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
}

interface Tabla {
  nombre: string;
  permisos: Permiso;
  mostrarPermisos: boolean;
}

interface Esquema {
  nombre: string;
  usage: boolean;
  permisoGlobal: boolean;
  mostrarTablas: boolean;
  tablas: Tabla[];
}

interface RolBase {
  id: number;
  nombre: string;
  descripcion: string;
}

interface RolCreado {
  id: number;
  nombre: string;
  rolBase: string;
  fechaCreacion: string;
  totalPermisos: number;
}

@Component({
  selector: 'app-roles-bd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-bd.html',
  styleUrls: ['./roles-bd.css']
})
export class RolesBdComponent implements OnInit {

  // Vistas
  vistaActual: 'LISTA' | 'CREAR' | 'EDITAR' = 'LISTA';

  // Roles creados
  rolesCreados: RolCreado[] = [];

  // Roles base disponibles
  rolesBase: RolBase[] = [];

  // Formulario de nuevo rol
  nuevoRol = {
    nombre: '',
    rolBaseId: null,
    descripcion: ''
  };

  // Esquemas y tablas
  esquemas: Esquema[] = [];

  // Estados de UI
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  // Rol en edición
  rolEnEdicion: RolCreado | null = null;

  constructor(private adminService: AdminService,   private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarRolesCreados();
    this.cargarRolesBase();
    this.cargarEsquemas();
  }

  // ========== CARGA DE DATOS ==========
  cargarRolesCreados(): void {
    this.cargando = true;

    this.adminService.obtenerRolesBD().subscribe({
      next: (data) => {
        this.rolesCreados = data.map((rol: any) => ({
          id: rol.idRol,          // Ahora recibirá el nombre del rol como string
          nombre: rol.nombreRol,  // Recibirá el nombre del rol
          rolBase: rol.rolBase || 'Ninguno',
          fechaCreacion: rol.fechaCreacion,
          totalPermisos: rol.totalPermisos || 0
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

  cargarRolesBase(): void {
    this.adminService.obtenerRolesBase().subscribe({
      next: (data) => {
        this.rolesBase = data.map((rol: any) => ({
          id: rol.idRol,
          nombre: rol.nombreRol,
          descripcion: rol.descripcion || ''
        }));
      },
      error: (err) => {
        console.error('Error al cargar roles base:', err);
      }
    });
  }

  cargarEsquemas(): void {
    this.adminService.obtenerEsquemasYTablas().subscribe({
      next: (data) => {
        this.esquemas = data.map((esquema: any) => ({
          nombre: esquema.nombreEsquema,
          usage: false,
          permisoGlobal: false,
          mostrarTablas: false,
          tablas: esquema.tablas.map((tabla: string) => ({
            nombre: tabla,
            permisos: {
              select: false,
              insert: false,
              update: false,
              delete: false
            },
            mostrarPermisos: false
          }))
        }));
      },
      error: (err) => {
        console.error('Error al cargar esquemas:', err);
        // Cargar esquemas por defecto
        this.cargarEsquemasDefault();
      }
    });
  }

  cargarEsquemasDefault(): void {
    this.esquemas = [
      {
        nombre: 'public',
        usage: false,
        permisoGlobal: false,
        mostrarTablas: false,
        tablas: [
          { nombre: 'usuario', permisos: { select: false, insert: false, update: false, delete: false }, mostrarPermisos: false },
          { nombre: 'rol', permisos: { select: false, insert: false, update: false, delete: false }, mostrarPermisos: false },
          { nombre: 'perfil', permisos: { select: false, insert: false, update: false, delete: false }, mostrarPermisos: false },
          { nombre: 'empresa', permisos: { select: false, insert: false, update: false, delete: false }, mostrarPermisos: false },
          { nombre: 'oferta_laboral', permisos: { select: false, insert: false, update: false, delete: false }, mostrarPermisos: false }
        ]
      }
    ];
  }

  // ========== GESTIÓN DE VISTAS ==========
  irACrear(): void {
    this.vistaActual = 'CREAR';
    this.limpiarFormulario();
  }

  irALista(): void {
    this.vistaActual = 'LISTA';
    this.limpiarFormulario();
  }

  irAEditar(rol: RolCreado): void {
    this.vistaActual = 'EDITAR';
    this.rolEnEdicion = rol;
    this.cargarPermisosRol(rol.id);
  }

  // ========== GESTIÓN DE ESQUEMAS ==========
  toggleMostrarTablas(esquema: Esquema): void {
    esquema.mostrarTablas = !esquema.mostrarTablas;
  }

  cambiarUsageEsquema(esquema: Esquema): void {
    if (!esquema.usage) {
      esquema.permisoGlobal = false;
      esquema.tablas.forEach(tabla => {
        tabla.permisos = { select: false, insert: false, update: false, delete: false };
      });
    }
  }

  cambiarPermisoGlobal(esquema: Esquema): void {
    if (esquema.permisoGlobal) {
      esquema.usage = true;
      esquema.tablas.forEach(tabla => {
        tabla.permisos = { select: true, insert: true, update: true, delete: true };
      });
    } else {
      esquema.tablas.forEach(tabla => {
        tabla.permisos = { select: false, insert: false, update: false, delete: false };
      });
    }
  }

  cambiarPermisoTabla(esquema: Esquema, tabla: Tabla): void {
    // Verificar si todos los permisos de todas las tablas están activos
    const todosActivos = esquema.tablas.every(t =>
      t.permisos.select && t.permisos.insert && t.permisos.update && t.permisos.delete
    );

    // Verificar si al menos un permiso está activo
    const algunoActivo = esquema.tablas.some(t =>
      t.permisos.select || t.permisos.insert || t.permisos.update || t.permisos.delete
    );

    // Actualizar permiso global
    esquema.permisoGlobal = todosActivos;

    // Si hay algún permiso activo, activar USAGE
    if (algunoActivo) {
      esquema.usage = true;
    }
  }

  toggleTodosPermisos(tabla: Tabla, valor: boolean): void {
    tabla.permisos = {
      select: valor,
      insert: valor,
      update: valor,
      delete: valor
    };
  }

  // ========== CREAR ROL ==========
  guardarRol(): void {
    // Validaciones
    if (!this.nuevoRol.nombre.trim()) {
      this.mostrarError('El nombre del rol es obligatorio');
      return;
    }

    // Validar que tenga permisos
    const tienePermisos = this.esquemas.some(e => e.usage);
    if (!tienePermisos) {
      this.mostrarError('Debe asignar al menos un permiso al rol');
      return;
    }

    this.guardando = true;

    // Construir objeto de permisos
    const permisos = this.construirObjetoPermisos();

    const datosRol = {
      nombreRol: this.nuevoRol.nombre,
      rolBaseId: this.nuevoRol.rolBaseId,
      descripcion: this.nuevoRol.descripcion,
      permisos: permisos
    };

    this.adminService.crearRolBD(datosRol).subscribe({
      next: (response) => {
        this.mostrarExito('Rol creado exitosamente');
        this.cargarRolesCreados();
        this.irALista();
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al crear rol:', err);
        this.mostrarError('Error al crear rol en la base de datos');
        this.guardando = false;
      }
    });
  }

  construirObjetoPermisos(): any {
    const permisos: any = {
      esquemas: []
    };

    this.esquemas.forEach(esquema => {
      if (esquema.usage) {
        const esquemaPermisos: any = {
          nombre: esquema.nombre,
          usage: true,
          global: esquema.permisoGlobal,
          tablas: []
        };

        if (!esquema.permisoGlobal) {
          // Solo agregar tablas con permisos específicos
          esquema.tablas.forEach(tabla => {
            const permisosActivos = [];
            if (tabla.permisos.select) permisosActivos.push('SELECT');
            if (tabla.permisos.insert) permisosActivos.push('INSERT');
            if (tabla.permisos.update) permisosActivos.push('UPDATE');
            if (tabla.permisos.delete) permisosActivos.push('DELETE');

            if (permisosActivos.length > 0) {
              esquemaPermisos.tablas.push({
                nombre: tabla.nombre,
                permisos: permisosActivos
              });
            }
          });
        }

        permisos.esquemas.push(esquemaPermisos);
      }
    });

    return permisos;
  }

  // ========== CARGAR PERMISOS PARA EDITAR ==========
  cargarPermisosRol(idRol: number): void {
    this.adminService.obtenerPermisosRol(idRol).subscribe({
      next: (data) => {
        // Aplicar permisos cargados a los esquemas
        this.aplicarPermisosAEsquemas(data);
      },
      error: (err) => {
        console.error('Error al cargar permisos:', err);
        this.mostrarError('Error al cargar permisos del rol');
      }
    });
  }

  aplicarPermisosAEsquemas(permisos: any): void {
    // Resetear todo primero
    this.esquemas.forEach(e => {
      e.usage = false;
      e.permisoGlobal = false;
      e.tablas.forEach(t => {
        t.permisos = { select: false, insert: false, update: false, delete: false };
      });
    });

    // Aplicar permisos del backend
    if (permisos.esquemas) {
      permisos.esquemas.forEach((esquemaPermiso: any) => {
        const esquema = this.esquemas.find(e => e.nombre === esquemaPermiso.nombre);
        if (esquema) {
          esquema.usage = esquemaPermiso.usage;
          esquema.permisoGlobal = esquemaPermiso.global;

          if (esquemaPermiso.tablas) {
            esquemaPermiso.tablas.forEach((tablaPermiso: any) => {
              const tabla = esquema.tablas.find(t => t.nombre === tablaPermiso.nombre);
              if (tabla) {
                tabla.permisos = {
                  select: tablaPermiso.permisos.includes('SELECT'),
                  insert: tablaPermiso.permisos.includes('INSERT'),
                  update: tablaPermiso.permisos.includes('UPDATE'),
                  delete: tablaPermiso.permisos.includes('DELETE')
                };
              }
            });
          }
        }
      });
    }
  }

  // ========== ELIMINAR ROL ==========
  eliminarRol(rol: RolCreado): void {
    if (!confirm(`¿Está seguro de eliminar el rol "${rol.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.adminService.eliminarRolBD(rol.id).subscribe({
      next: (response) => {
        this.mostrarExito('Rol eliminado exitosamente');
        this.cargarRolesCreados();
      },
      error: (err) => {
        console.error('Error al eliminar rol:', err);
        this.mostrarError('Error al eliminar rol');
      }
    });
  }

  // ========== UTILIDADES ==========
  limpiarFormulario(): void {
    this.nuevoRol = {
      nombre: '',
      rolBaseId: null,
      descripcion: ''
    };

    this.esquemas.forEach(esquema => {
      esquema.usage = false;
      esquema.permisoGlobal = false;
      esquema.mostrarTablas = false;
      esquema.tablas.forEach(tabla => {
        tabla.permisos = { select: false, insert: false, update: false, delete: false };
        tabla.mostrarPermisos = false;
      });
    });

    this.rolEnEdicion = null;
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

  getEstadoEsquema(esquema: Esquema): string {
    if (esquema.permisoGlobal) return 'global';

    const algunPermisoActivo = esquema.tablas.some(t =>
      t.permisos.select || t.permisos.insert || t.permisos.update || t.permisos.delete
    );

    if (algunPermisoActivo) return 'parcial';
    return 'ninguno';
  }

  contarPermisosActivos(esquema: Esquema): number {
    let total = 0;
    esquema.tablas.forEach(tabla => {
      if (tabla.permisos.select) total++;
      if (tabla.permisos.insert) total++;
      if (tabla.permisos.update) total++;
      if (tabla.permisos.delete) total++;
    });
    return total;
  }
}
