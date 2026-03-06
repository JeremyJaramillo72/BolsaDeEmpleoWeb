import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ConfirmService } from '../../../../services/confirm.service';

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

// ========== ✨ NUEVO: Interface para usuarios del sistema ==========
interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rolActual: string;
  seleccionado: boolean;
}

interface RolCreado {
  id: number;
  nombre: string;
  rolBase: string;
  fechaCreacion: string;
  totalPermisos: number;
  usuariosAsignados: number; // ✨ NUEVO: contador de usuarios asignados
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

  // ========== ✨ NUEVO: Variables para gestión de usuarios ==========
  usuariosDisponibles: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busquedaUsuario: string = '';
  // ================================================================

  // Formulario de nuevo rol - ✨ MODIFICADO: eliminado campo 'descripcion'
  nuevoRol = {
    nombre: '',
    rolBaseId: null
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

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarRolesCreados();
    this.cargarRolesBase();
    this.cargarEsquemas();
    this.cargarUsuarios(); // ✨ NUEVO: cargar usuarios del sistema
  }

  // ========== CARGA DE DATOS ==========
  cargarRolesCreados(): void {
    this.cargando = true;

    this.adminService.obtenerRolesBD().subscribe({
      next: (data) => {
        this.rolesCreados = data.map((rol: any) => ({
          id: rol.idRol,
          nombre: rol.nombreRol,
          rolBase: rol.rolBase || 'Ninguno',
          fechaCreacion: rol.fechaCreacion,
          totalPermisos: rol.totalPermisos || 0,
          usuariosAsignados: rol.usuariosAsignados || 0 // ✨ NUEVO
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
          descripcion: rol.descripcion || 'Rol de grupo en PostgreSQL' // ✨ MODIFICADO: descripción más clara
        }));
      },
      error: (err) => {
        console.error('Error al cargar roles base:', err);
        // ✨ NUEVO: roles base por defecto si falla
        this.rolesBase = [
          { id: 1, nombre: 'grupo_postulante', descripcion: 'Permisos base para postulantes' },
          { id: 2, nombre: 'grupo_empresa', descripcion: 'Permisos base para empresas' },
          { id: 3, nombre: 'grupo_admin', descripcion: 'Permisos base para administradores' }
        ];
      }
    });
  }

  // ========== ✨ NUEVO: Cargar usuarios del sistema ==========
  cargarUsuarios(): void {
    this.adminService.obtenerTodosUsuarios().subscribe({
      next: (data) => {
        this.usuariosDisponibles = data.map((usuario: any) => ({
          id: usuario.idUsuario,
          nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
          email: usuario.correo,
          rolActual: usuario.rol ? usuario.rol.nombreRol : 'Sin Rol',
          seleccionado: false
        }));
        this.usuariosFiltrados = [...this.usuariosDisponibles];
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mostrarError('Error al cargar usuarios del sistema');
      }
    });
  }
  // ============================================================

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

  // ========== ✨ NUEVO: GESTIÓN DE USUARIOS ==========
  filtrarUsuarios(): void {
    if (!this.busquedaUsuario.trim()) {
      this.usuariosFiltrados = [...this.usuariosDisponibles];
    } else {
      const busqueda = this.busquedaUsuario.toLowerCase();
      this.usuariosFiltrados = this.usuariosDisponibles.filter(u =>
        u.nombreCompleto.toLowerCase().includes(busqueda) ||
        u.email.toLowerCase().includes(busqueda)
      );
    }
  }

  toggleTodosUsuarios(seleccionar: boolean): void {
    this.usuariosFiltrados.forEach(u => u.seleccionado = seleccionar);
  }

  get usuariosSeleccionados(): Usuario[] {
    return this.usuariosDisponibles.filter(u => u.seleccionado);
  }

  get totalUsuariosSeleccionados(): number {
    return this.usuariosSeleccionados.length;
  }
  // ==================================================

  // ========== GESTIÓN DE VISTAS ==========
  irACrear(): void {
    this.vistaActual = 'CREAR';
    this.limpiarFormulario();
  }

  irALista(): void {
    this.vistaActual = 'LISTA';
    this.limpiarFormulario();
  }

  // ✨ MODIFICADO: ahora también carga usuarios del rol
  irAEditar(rol: RolCreado): void {
    this.vistaActual = 'EDITAR';
    this.rolEnEdicion = rol;
    this.cargarPermisosRol(rol.id);
    this.cargarUsuariosDelRol(rol.id); // ✨ NUEVO
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
    const todosActivos = esquema.tablas.every(t =>
      t.permisos.select && t.permisos.insert && t.permisos.update && t.permisos.delete
    );

    const algunoActivo = esquema.tablas.some(t =>
      t.permisos.select || t.permisos.insert || t.permisos.update || t.permisos.delete
    );

    esquema.permisoGlobal = todosActivos;

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

  // ========== ✨ MODIFICADO: CREAR/ACTUALIZAR ROL (ahora incluye usuarios) ==========
  guardarRol(): void {
    // Validaciones
    if (!this.nuevoRol.nombre.trim()) {
      this.mostrarError('El nombre del rol es obligatorio');
      return;
    }

    const tienePermisos = this.esquemas.some(e => e.usage);
    if (!tienePermisos) {
      this.mostrarError('Debe asignar al menos un permiso al rol');
      return;
    }

    // ✨ NUEVO: validar que tenga usuarios seleccionados
    if (this.totalUsuariosSeleccionados === 0) {
      this.mostrarError('Debe seleccionar al menos un usuario para asignar este rol');
      return;
    }

    this.guardando = true;

    const permisos = this.construirObjetoPermisos();
    const usuariosIds = this.usuariosSeleccionados.map(u => u.id); // ✨ NUEVO

    const datosRol = {
      nombreRol: this.nuevoRol.nombre,
      rolBaseId: this.nuevoRol.rolBaseId,
      permisos: permisos,
      usuariosIds: usuariosIds // ✨ NUEVO: incluir IDs de usuarios
    };

    // ✨ NUEVO: diferenciar entre crear y actualizar
    if (this.vistaActual === 'CREAR') {
      this.crearRol(datosRol);
    } else {
      this.actualizarRol(datosRol);
    }
  }

  // ✨ NUEVO: método separado para crear
  crearRol(datosRol: any): void {
    // Filtrar al usuario logueado para que no se autoasigne
    const idUsuarioActual = Number(localStorage.getItem('idUsuario'));
    datosRol.usuariosIds = datosRol.usuariosIds.filter((id: number) => id !== idUsuarioActual);

    this.adminService.crearRolBD(datosRol).subscribe({
      next: (response) => {
        this.mostrarExito(`Rol creado exitosamente. ${this.totalUsuariosSeleccionados} usuario(s) asignado(s).`);
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

  // ✨ NUEVO: método separado para actualizar
  actualizarRol(datosRol: any): void {
    if (!this.rolEnEdicion) return;

    this.adminService.actualizarRolBD(this.rolEnEdicion.id, datosRol).subscribe({
      next: (response) => {
        this.mostrarExito('Rol actualizado exitosamente');
        this.cargarRolesCreados();
        this.irALista();
        this.guardando = false;
      },
      error: (err) => {
        console.error('Error al actualizar rol:', err);
        this.mostrarError('Error al actualizar rol');
        this.guardando = false;
      }
    });
  }
  // ============================================================================

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

  // ========== ✨ MODIFICADO: CARGAR PERMISOS PARA EDITAR ==========
  cargarPermisosRol(idRol: number): void {
    this.adminService.obtenerPermisosRol(idRol).subscribe({
      next: (data) => {
        this.aplicarPermisosAEsquemas(data);
        // ✨ NUEVO: cargar también el nombre y rol base
        this.nuevoRol.nombre = data.nombreRol || '';
        this.nuevoRol.rolBaseId = data.rolBaseId || null;
      },
      error: (err) => {
        console.error('Error al cargar permisos:', err);
        this.mostrarError('Error al cargar permisos del rol');
      }
    });
  }

  // ========== ✨ NUEVO: Cargar usuarios que tienen este rol ==========
  cargarUsuariosDelRol(idRol: number): void {
    this.adminService.obtenerUsuariosDelRol(idRol).subscribe({
      next: (data) => {
        const idsUsuariosDelRol = data.map((u: any) => u.idUsuario);
        this.usuariosDisponibles.forEach(usuario => {
          usuario.seleccionado = idsUsuariosDelRol.includes(usuario.id);
        });
        this.usuariosFiltrados = [...this.usuariosDisponibles];
      },
      error: (err) => {
        console.error('Error al cargar usuarios del rol:', err);
      }
    });
  }
  // =================================================================

  aplicarPermisosAEsquemas(permisos: any): void {
    this.esquemas.forEach(e => {
      e.usage = false;
      e.permisoGlobal = false;
      e.tablas.forEach(t => {
        t.permisos = { select: false, insert: false, update: false, delete: false };
      });
    });

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

  // ========== ✨ MODIFICADO: ELIMINAR ROL (ahora muestra usuarios afectados) ==========
  eliminarRol(rol: RolCreado): void {
    this.confirmService.abrir(`¿Está seguro de eliminar el rol "${rol.nombre}"? Los ${rol.usuariosAsignados} usuario(s) asignado(s) perderán este rol. Esta acción no se puede deshacer.`).then(acepto => {
      if (!acepto) return;
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
    });
  }

  // ========== ✨ MODIFICADO: UTILIDADES ==========
  limpiarFormulario(): void {
    this.nuevoRol = {
      nombre: '',
      rolBaseId: null
      // ✨ ELIMINADO: ya no tiene 'descripcion'
    };

    // ✨ NUEVO: resetear búsqueda y selección de usuarios
    this.busquedaUsuario = '';
    this.usuariosDisponibles.forEach(u => u.seleccionado = false);
    this.usuariosFiltrados = [...this.usuariosDisponibles];

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
