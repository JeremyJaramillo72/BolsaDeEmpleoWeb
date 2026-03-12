import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { Esquema, RolBase, RolCreado, Tabla, Usuario } from '../roles-bd';
import { Router } from '@angular/router';

@Component({
  selector: 'app-roles-bd-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-bd-form.html',
  styleUrls: ['./roles-bd-form.css']
})
export class RolesBdFormComponent implements OnInit {
  @Input() vistaActual: 'CREAR' | 'EDITAR' = 'CREAR';
  @Input() rolEnEdicion: RolCreado | null = null;

  @Output() cancelado = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  rolesBase: RolBase[] = [];
  usuariosDisponibles: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  busquedaUsuario: string = '';

  nuevoRol: { nombre: string; rolBaseId: string | null } = {
    nombre: '',
    rolBaseId: null
  };

  esquemas: Esquema[] = [];
  guardando = false;

  // INYECTAMOS EL ChangeDetectorRef AQUÍ
  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarRolesBase();
    this.cargarEsquemas();
    this.cargarUsuarios();

    if (this.vistaActual === 'EDITAR' && this.rolEnEdicion) {
      this.cargarPermisosRol(this.rolEnEdicion.id);
      this.cargarUsuariosDelRol(this.rolEnEdicion.id);
    }
  }

  cargarRolesBase(): void {
    this.adminService.obtenerRolesBase().subscribe({
      next: (data) => {
        this.rolesBase = data.map((rol: any) => ({
          id: String(rol.idRol),
          nombre: rol.nombreRol,
          descripcion: rol.descripcion || 'Rol de grupo en PostgreSQL'
        }));
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al cargar roles base:', err);
        this.rolesBase = [
          { id: '1', nombre: 'grupo_postulante', descripcion: 'Permisos base para postulantes' },
          { id: '2', nombre: 'grupo_empresa', descripcion: 'Permisos base para empresas' },
          { id: '3', nombre: 'grupo_admin', descripcion: 'Permisos base para administradores' }
        ];
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      }
    });
  }

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
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.mostrarError('Error al cargar usuarios del sistema');
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
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
            permisos: { select: false, insert: false, update: false, delete: false },
            mostrarPermisos: false
          }))
        }));
        this.cdr.detectChanges(); // <-- AQUÍ ESTÁ LA MAGIA PARA QUE CARGUEN LOS ESQUEMAS
      },
      error: (err) => {
        console.error('Error al cargar esquemas:', err);
        this.cargarEsquemasDefault();
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
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

  irALista(): void {
    this.cancelado.emit();
  }

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
    tabla.permisos = { select: valor, insert: valor, update: valor, delete: valor };
  }

  guardarRol(): void {
    if (!this.nuevoRol.nombre.trim()) {
      this.mostrarError('El nombre del rol es obligatorio');
      return;
    }

    const tienePermisos = this.esquemas.some(e => e.usage);
    if (!tienePermisos) {
      this.mostrarError('Debe asignar al menos un permiso al rol');
      return;
    }

    if (this.totalUsuariosSeleccionados === 0) {
      this.mostrarError('Debe seleccionar al menos un usuario para asignar este rol');
      return;
    }

    this.guardando = true;
    const permisos = this.construirObjetoPermisos();
    const usuariosIds = this.usuariosSeleccionados.map(u => u.id);

    const datosRol = {
      nombreRol: this.nuevoRol.nombre,
      rolBaseId: this.nuevoRol.rolBaseId,
      permisos: permisos,
      usuariosIds: usuariosIds
    };

    if (this.vistaActual === 'CREAR') {
      this.crearRol(datosRol);
    } else {
      this.actualizarRol(datosRol);
    }
  }

  crearRol(datosRol: any): void {
    const idUsuarioActual = Number(localStorage.getItem('idUsuario'));
    datosRol.usuariosIds = datosRol.usuariosIds.filter((id: number) => id !== idUsuarioActual);

    this.adminService.crearRolBD(datosRol).subscribe({
      next: () => {
        this.mostrarExito(`Rol creado exitosamente. ${this.totalUsuariosSeleccionados} usuario(s) asignado(s).`);
        this.guardando = false;
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al crear rol:', err);
        this.mostrarError('Error al crear rol en la base de datos');
        this.guardando = false;
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      }
    });
  }

  actualizarRol(datosRol: any): void {
    if (!this.rolEnEdicion) return;
    this.adminService.actualizarRolBD(this.rolEnEdicion.id, datosRol).subscribe({
      next: () => {
        this.mostrarExito('Rol actualizado exitosamente');
        this.guardando = false;
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al actualizar rol:', err);
        this.mostrarError('Error al actualizar rol');
        this.guardando = false;
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      }
    });
  }

  construirObjetoPermisos(): any {
    const permisos: any = { esquemas: [] };
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
              esquemaPermisos.tablas.push({ nombre: tabla.nombre, permisos: permisosActivos });
            }
          });
        }
        permisos.esquemas.push(esquemaPermisos);
      }
    });
    return permisos;
  }

  cargarPermisosRol(idRol: string): void {
    this.adminService.obtenerPermisosRol(idRol).subscribe({
      next: (data) => {
        this.aplicarPermisosAEsquemas(data);
        this.nuevoRol.nombre = data.nombreRol || '';
        this.nuevoRol.rolBaseId = data.rolBaseId ? String(data.rolBaseId) : null;
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al cargar permisos:', err);
        this.mostrarError('Error al cargar permisos del rol');
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      }
    });
  }

  cargarUsuariosDelRol(idRol: string): void {
    this.adminService.obtenerUsuariosDelRol(idRol).subscribe({
      next: (data) => {
        const idsUsuariosDelRol = data.map((u: any) => u.idUsuario);
        this.usuariosDisponibles.forEach(usuario => {
          usuario.seleccionado = idsUsuariosDelRol.includes(usuario.id);
        });
        this.usuariosFiltrados = [...this.usuariosDisponibles];
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      },
      error: (err) => {
        console.error('Error al cargar usuarios del rol:', err);
        this.cdr.detectChanges(); // <-- FORZAMOS RENDERIZADO
      }
    });
  }

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

  mostrarExito(mensaje: string): void {
    this.guardado.emit(mensaje);
  }

  mostrarError(mensaje: string): void {
    this.error.emit(mensaje);
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
