import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './Service/UsuariosService';
import { ConfirmService } from '../../../../services/confirm.service';

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

  // --- MENSAJES ---
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRolesInternos();
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

  // ==========================================
  // LÓGICA DE CREACIÓN DE USUARIOS
  // ==========================================

  cargarRolesInternos() {
    // NOTA: Asegúrate de tener este método en tu UsuariosService
    this.usuariosService.obtenerRolesDeBD().subscribe({
      next: (data: any) => {
        this.rolesDisponibles = data
          .filter((rol: any) => rol.idRol !== 2 && rol.idRol !== 3 && rol.idRol !== 1)
          .map((rol: any) => ({
            id: rol.idRol,
            etiqueta: rol.nombreRol
          }));
      },
      error: (e: any) => console.error('Error cargando roles', e)
    });
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
      telefono: '0987654321',
      genero: 'Masculino',
      fechaNacimiento: '2000-01-01',
      rol: { idRol: this.nuevoUsuario.rolId },
      ciudad: { idCiudad: 1 },
      permisosUi: '',
      estadoValidacion: 'Activo'
    };

    this.isLoading = true;

    // NOTA: Asegúrate de tener crearUsuario (o el nombre que uses) en UsuariosService
    this.usuariosService.crearUsuario(usuarioParaBackend).subscribe({
      next: (respuesta: any) => {
        this.mostrarExito('Usuario creado exitosamente');
        setTimeout(() => {
          this.cancelarCreacion();
          this.cargarUsuarios(); // Recargamos la tabla
        }, 500);
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
