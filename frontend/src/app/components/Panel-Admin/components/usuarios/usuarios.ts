import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './Service/UsuariosService';
import { ConfirmService } from '../../../../services/confirm.service';
import { UiNotificationService } from '../../../../services/ui-notification.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {

  // --- CONTROL DE VISTAS ---
  vistaActual: 'LISTA' | 'CREAR' = 'LISTA';
  isLoading: boolean = false;
  eliminandoId: number | null = null;

  // --- DATOS DE TABLA Y BÚSQUEDA ---
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  terminoBusqueda: string = '';

  // --- PAGINACIÓN ---
  currentPage: number = 1;
  pageSize: number = 7;

  // --- DATOS DE CREACIÓN ---
  nuevoUsuario = {
    usuario: '',
    contrasena: '',
    rolId: null as number | null,
    nombre: '',
    apellido: ''
  };
  rolesDisponibles: any[] = [];
  ciudadesDisponibles: any[] = [];

  mostrarModalEditar = false;
  guardandoEdicion = false;
  formularioEdicion = {
    idUsuario: null as number | null,
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    rolId: null as number | null,
    idCiudad: null as number | null,
    contrasena: ''
  };

  // --- MENSAJES ---
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private ui: UiNotificationService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRolesInternos();
    this.cargarCiudades();
  }

  // ==========================================
  // LÓGICA DE LISTADO, FILTRO Y ESTADOS
  // ==========================================

  cargarUsuarios(): void {
    this.isLoading = true;
    this.usuariosService.getUsuariosTabla().subscribe({
      next: (data) => {
        this.usuarios = [...data];
        this.usuariosFiltrados = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mostrarError('Error al cargar la lista de usuarios');
        this.isLoading = false;
      }
    });
  }

  filtrarUsuarios(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(termino)) ||
        (u.correo && u.correo.toLowerCase().includes(termino)) ||
        (u.nombre_rol && u.nombre_rol.toLowerCase().includes(termino))
      );
    }
    this.currentPage = 1; // Resetear a la página 1 después de buscar
  }

  obtenerInicial(nombre: string): string {
    if (!nombre) return 'U';
    return nombre.charAt(0).toUpperCase();
  }

  bloquearUsuario(usr: any): void {
    const nuevoEstado = usr.estado_validacion === 'Aprobado' ? 'Pendiente' : 'Aprobado';
    const accionTexto = usr.estado_validacion === 'Aprobado' ? 'inactivar' : 'activar';

    this.confirmService.abrir(`¿Está seguro de ${accionTexto} a este usuario?`, 'Confirmar Acción').then(acepto => {
      if (acepto) {
        this.isLoading = true;
        this.usuariosService.cambiarEstadoUsuario(usr.id_usuario, nuevoEstado).subscribe({
          next: () => {
            const estadoVisual = nuevoEstado === 'Aprobado' ? 'ACTIVO' : 'INACTIVO';
            this.mostrarExito(`Usuario actualizado a ${estadoVisual} exitosamente.`);
            this.cargarUsuarios();
          },
          error: () => {
            this.mostrarError('Error al cambiar el estado del usuario');
            this.isLoading = false;
          }
        });
      }
    });
  }

  abrirEditar(usr: any): void {
    this.isLoading = true;
    this.usuariosService.obtenerUsuario(usr.id_usuario).subscribe({
      next: (data) => {
        this.formularioEdicion = {
          idUsuario: data.idUsuario,
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          rolId: data.idRol ?? null,
          idCiudad: data.idCiudad ?? null,
          contrasena: ''
        };
        this.asegurarRolEnLista(data.idRol, data.nombreRol);
        this.mostrarModalEditar = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mostrarError('No se pudo cargar los datos del usuario');
        this.isLoading = false;
      }
    });
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.formularioEdicion = {
      idUsuario: null,
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      rolId: null,
      idCiudad: null,
      contrasena: ''
    };
  }

  guardarEdicion(): void {
    if (!this.formularioEdicion.idUsuario) return;

    if (!this.formularioEdicion.nombre?.trim() || !this.formularioEdicion.correo?.trim()) {
      this.mostrarError('Nombre y correo son obligatorios.');
      return;
    }

    const payload: any = {
      nombre: this.formularioEdicion.nombre.trim(),
      apellido: this.formularioEdicion.apellido.trim(),
      correo: this.formularioEdicion.correo.trim(),
      telefono: this.formularioEdicion.telefono?.trim() || '',
      rolId: this.formularioEdicion.rolId,
      idCiudad: this.formularioEdicion.idCiudad
    };

    if (this.formularioEdicion.contrasena?.trim()) {
      payload.contrasena = this.formularioEdicion.contrasena.trim();
    }

    this.guardandoEdicion = true;
    this.usuariosService.actualizarUsuario(this.formularioEdicion.idUsuario, payload).subscribe({
      next: () => {
        this.mostrarExito('Usuario actualizado correctamente.');
        this.guardandoEdicion = false;
        this.cerrarModalEditar();
        this.cargarUsuarios();
      },
      error: (err) => {
        const msg = err.error?.error || 'Error al actualizar el usuario';
        this.mostrarError(msg);
        this.guardandoEdicion = false;
      }
    });
  }

  confirmarEliminar(usr: any): void {
    const nombreVisible = (usr.nombre || usr.correo || 'Usuario').trim();

    this.confirmService.abrir(
      `¿Eliminar permanentemente a ${nombreVisible} (${usr.correo})? Esta acción no se puede deshacer.`,
      'Eliminar Usuario',
      'advertencia'
    ).then(acepto => {
      if (!acepto) return;

      this.ngZone.run(() => {
        this.eliminandoId = usr.id_usuario;
        this.cdr.detectChanges();
      });

      this.usuariosService.eliminarUsuario(usr.id_usuario).subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.usuarios = this.usuarios.filter(u => u.id_usuario !== usr.id_usuario);
            this.usuariosFiltrados = this.usuariosFiltrados.filter(u => u.id_usuario !== usr.id_usuario);
            this.eliminandoId = null;

            if (this.currentPage > this.totalPages) {
              this.currentPage = this.totalPages;
            }

            this.ui.exito(`Usuario "${nombreVisible}" eliminado correctamente.`);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.eliminandoId = null;
            const msg = err.error?.error || 'No se pudo eliminar el usuario';
            this.ui.error(msg);
            this.cdr.detectChanges();
          });
        }
      });
    });
  }

  puedeEliminar(usr: any): boolean {
    const rol = (usr.nombre_rol || '').toLowerCase();
    return rol !== 'administrador';
  }

  // ==========================================
  // LÓGICA DE CREACIÓN DE USUARIOS
  // ==========================================

  cargarRolesInternos() {
    this.usuariosService.obtenerRolesDeBD().subscribe({
      next: (data: any) => {
        this.rolesDisponibles = data
          .filter((rol: any) => rol.idRol !== 1 && rol.idRol !== 2 && rol.idRol !== 3)
          .map((rol: any) => ({
            id: rol.idRol,
            etiqueta: rol.nombreRol
          }));
      },
      error: (e: any) => console.error('Error cargando roles', e)
    });
  }

  cargarCiudades() {
    this.usuariosService.obtenerCiudades().subscribe({
      next: (data) => {
        this.ciudadesDisponibles = data.map((c: any) => ({
          id: c.idCiudad ?? c.id_ciudad,
          nombre: c.nombreCiudad ?? c.nombre_ciudad
        }));
      },
      error: () => console.error('Error cargando ciudades')
    });
  }

  private asegurarRolEnLista(idRol: number | null, nombreRol: string | null) {
    if (idRol == null) return;
    const existe = this.rolesDisponibles.some(r => r.id === idRol);
    if (!existe && nombreRol) {
      this.rolesDisponibles = [{ id: idRol, etiqueta: nombreRol }, ...this.rolesDisponibles];
    }
  }

  iniciarCreacion() {
    this.vistaActual = 'CREAR';
    this.limpiarFormulario();
  }

  cancelarCreacion() {
    this.vistaActual = 'LISTA';
    this.limpiarFormulario();
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.usuario || !this.nuevoUsuario.contrasena || this.nuevoUsuario.rolId == null) {
      this.mostrarError('Por favor completa: Correo, Contraseña y Rol.');
      return;
    }

    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido) {
      this.mostrarError('Por favor completa: Nombre y Apellido.');
      return;
    }

    const usuarioParaBackend = {
      nombre: this.nuevoUsuario.nombre,
      apellido: this.nuevoUsuario.apellido,
      correo: this.nuevoUsuario.usuario,
      contrasena: this.nuevoUsuario.contrasena,
      telefono: '0987654321', // Recuerda que esto está quemado por ahora jsjs
      genero: 'Masculino',
      fechaNacimiento: '2000-01-01',
      rol: { idRol: this.nuevoUsuario.rolId },
      ciudad: { idCiudad: 1 },
      permisosUi: '',
      estadoValidacion: 'Activo'
    };

    this.isLoading = true;

    // NOTA: Asegúrate de tener crearUsuario en UsuariosService apuntando a tu Controller
    this.usuariosService.crearUsuario(usuarioParaBackend).subscribe({
      next: (respuesta: any) => {
        // 🔥 NUEVO: Cambiamos el mensaje para que el admin sepa del correo
        this.mostrarExito('¡Usuario creado! Las credenciales han sido enviadas a su correo.');

        // 🔥 NUEVO: Aumentamos el tiempo a 2000ms (2 segundos) para que lea el mensaje
        setTimeout(() => {
          this.cancelarCreacion();
          this.cargarUsuarios(); // Recargamos la tabla
        }, 2000);
      },
      error: (error: any) => {
        console.error('Error HTTP:', error);
        const mensaje = error.error?.text || error.error || error.message;
        this.mostrarError('Ocurrió un error: ' + mensaje);
        this.isLoading = false;
      }
    });
  }

  private limpiarFormulario() {
    this.nuevoUsuario = { usuario: '', contrasena: '', rolId: null, nombre: '', apellido: '' };
  }

  // ==========================================
  // HELPERS DE PAGINACIÓN (Basados en filtrados)
  // ==========================================
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.usuariosFiltrados.length / this.pageSize));
  }

  get usuariosPagina() {
    const start = (this.currentPage - 1) * this.pageSize;
    // Usamos usuariosFiltrados para que la paginación respete la búsqueda
    return this.usuariosFiltrados.slice(start, start + this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  prevPage() {
    if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); }
  }

  goToPage(n: number) {
    if (n >= 1 && n <= this.totalPages) { this.currentPage = n; this.cdr.detectChanges(); }
  }

  get displayStart(): number {
    if (this.usuariosFiltrados.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.usuariosFiltrados.length);
  }

  // ==========================================
  // NOTIFICACIONES UI
  // ==========================================
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 3000);
  }
}
