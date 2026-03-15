import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UiNotificationService } from '../../../../services/ui-notification.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-mini-admi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mini-admi.html',
  styleUrls: ['./admin-mini-admi.css']
})
export class AdminMiniAdmiComponent implements OnInit, OnDestroy {

  vistaActual: 'LISTA' | 'CREAR' = 'LISTA';
  listaAdmins: any[] = [];
  isLoading: boolean = true;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 7;

  nuevoAdmin = {
    usuario: '',
    contrasena: '',
    rolId: null,
    nombre: '',
    apellido: ''
  };

  rolesDisponibles: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService,
    private confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    this.cargarListaAdminsRegistrados();
    this.cargarRolesInternos();

    this.adminService.adminsActualizados
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cargarListaAdminsRegistrados();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarListaAdminsRegistrados() {
    this.isLoading = true;
    this.adminService.obtenerAdminsRegistrados().subscribe({
      next : (data) => {
        this.listaAdmins = data.map(usuario => ({
          id: usuario.idUsuario,
          usuario: usuario.correo,
          rolBD: usuario.rol ? usuario.rol.nombreRol : "Sin Rol",
          fechaCreacion: usuario.fechaRegistro,
          permisosUI: usuario.permisosUi ? usuario.permisosUi.split(',') : [],
          estadoValidacion: usuario.estadoValidacion,
        }));
        this.currentPage = 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('Error cargando lista de admins:', e);
        this.isLoading = false;
      }
    });
  }

  cargarRolesInternos() {
    this.adminService.obtenerRolesDeBD().subscribe({
      next: (data) => {
        this.rolesDisponibles = data
          .filter((rol: any) => rol.idRol !== 2 && rol.idRol !== 3 && rol.idRol !== 1)
          .map((rol: any) => ({
            id: rol.idRol,
            etiqueta: rol.nombreRol
          }));
      },
      error: (e) => console.error('Error cargando roles', e)
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

  guardarAdmin() {
    if (!this.nuevoAdmin.usuario || !this.nuevoAdmin.contrasena || this.nuevoAdmin.rolId == null) {
      this.ui.advertencia('Por favor completa: Correo, Contraseña y Rol.');
      return;
    }

    if (!this.nuevoAdmin.nombre || !this.nuevoAdmin.apellido) {
      this.ui.advertencia('Por favor completa: Nombre y Apellido (Requeridos por BD).');
      return;
    }

    // Armar el objeto JSON (Ya no mandamos string de permisos)
    const usuarioParaBackend = {
      nombre: this.nuevoAdmin.nombre,
      apellido: this.nuevoAdmin.apellido,
      correo: this.nuevoAdmin.usuario,
      contrasena: this.nuevoAdmin.contrasena,
      telefono: '0987654321',
      genero: 'Masculino',
      fechaNacimiento: '2000-01-01',
      rol: {
        idRol: this.nuevoAdmin.rolId
      },
      ciudad: {
        idCiudad: 1
      },
      permisosUi: '', // <-- Va vacío porque el permiso ahora depende del ROL, no del usuario directo
      estadoValidacion: 'Activo'
    };

    console.log('Enviando admin:', usuarioParaBackend);
    this.isLoading = true;

    this.adminService.crearAdministrador(usuarioParaBackend).subscribe({
      next: (respuesta) => {
        console.log('Respuesta Backend:', respuesta);
        this.ui.exito(respuesta);

        setTimeout(() => {
          this.cancelarCreacion();
          this.isLoading = true;
          this.adminService.notificarCambio();
        }, 500);
      },
      error: (error) => {
        console.error('Error HTTP:', error);
        const mensaje = error.error?.text || error.error || error.message;
        this.ui.error('Ocurrió un error: ' + mensaje);
        this.isLoading = false;
      }
    });
  }

  toggleEstado(admin: any) {
    const estadoActual = admin.estadoValidacion;
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    if (nuevoEstado === 'Inactivo') {
      this.confirmService.abrir(`¿Seguro que deseas Desactivar a ${admin.usuario}?`).then(acepto => {
        if (!acepto) return;
        this.ejecutarCambioEstado(admin.id, nuevoEstado);
      });
    } else {
      this.ejecutarCambioEstado(admin.id, nuevoEstado);
    }
  }

  private ejecutarCambioEstado(id: number, nuevoEstado: string) {
    this.isLoading = true;
    this.adminService.cambiarEstadoAdmin(id, nuevoEstado).subscribe({
      next: (respuesta) => {
        this.ui.exito('Estado actualizado exitosamente');
        setTimeout(() => this.adminService.notificarCambio(), 300);
      },
      error: (e) => {
        console.error(e);
        this.ui.error('Error al cambiar el estado. Revisa la consola.');
        this.isLoading = false;
      }
    });
  }

  desactivarUsuario(admin: any) {
    this.confirmService.abrir(`¿Estás seguro de desactivar al usuario ${admin.usuario}?`).then(acepto => {
      if (!acepto) return;
      this.ejecutarCambioEstado(admin.id, 'Inactivo');
    });
  }

  private limpiarFormulario() {
    this.nuevoAdmin = { usuario: '', contrasena: '', rolId: null, nombre: '', apellido: '' };
  }

  // Helpers Paginación
  get totalPages(): number { return Math.max(1, Math.ceil(this.listaAdmins.length / this.pageSize)); }
  get adminsPagina() { const start = (this.currentPage - 1) * this.pageSize; return this.listaAdmins.slice(start, start + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); } }
  goToPage(n: number) { if (n >= 1 && n <= this.totalPages) { this.currentPage = n; this.cdr.detectChanges(); } }
  get displayStart(): number { if (this.listaAdmins.length === 0) return 0; return (this.currentPage - 1) * this.pageSize + 1; }
  get displayEnd(): number { return Math.min(this.currentPage * this.pageSize, this.listaAdmins.length); }

  formatEstado(admin: any): string {
    const val = admin?.estadoValidacion;
    if (!val) return 'Pendiente';
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  }
}
