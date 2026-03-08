import { Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { UiNotificationService } from '../../../../services/ui-notification.service';
import { ConfirmService } from '../../../../services/confirm.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-admin-mini-admi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mini-admi.html',
  styleUrls: ['./admin-mini-admi.css'],
  // providers: [AdminService] <--- NO es necesario si el servicio tiene providedIn: 'root'
})
export class AdminMiniAdmiComponent implements OnInit, OnDestroy {

  vistaActual: 'LISTA' | 'CREAR' = 'LISTA';
  listaAdmins: any[] = [];
  isLoading: boolean = true; // Bandera para mostrar loading

  // Paginación
  currentPage: number = 1;
  pageSize: number = 7; // mostrar 7 filas por página

  nuevoAdmin = {
    usuario: '',
    contrasena: '',
    rolId: null,
    nombre: '',
    apellido: ''
  };

  rolesDisponibles: any[] = [];

  seccionesDisponibles = [
    { key: 'USERS', nombre: 'Gestión de Usuarios', seleccionada: false },
    { key: 'CATALOGOS', nombre: 'Gestión de Catálogos', seleccionada: false },
    { key: 'VALIDACION_0', nombre: 'Validación de Ofertas', seleccionada: false },
    { key: 'REPORTES', nombre: 'Reportes y Estadísticas', seleccionada: false },
    { key: 'VALIDACION_E', nombre: 'Validacion Empresas', seleccionada: false }
  ];

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

    // Subscribirse a cambios de la lista
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

  cargarListaAdminsRegistrados()
  {
    this.isLoading = true;
    this.adminService.obtenerAdminsRegistrados().subscribe(
      {
        next : (data) =>
        {
          this.listaAdmins = data.map
          (usuario =>
            ({
              id: usuario.idUsuario,
            usuario: usuario.correo,
            rolBD: usuario.rol? usuario.rol.nombreRol : "Sin Rol",
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
          // Filtramos IDs 2 (Empresa), 3 (Postulante) y 1 (Admin Maestro si aplica)
          .filter(rol => rol.idRol !== 2 && rol.idRol !== 3 && rol.idRol !== 1)
          .map(rol => ({
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
    // 1. Validaciones
    if (!this.nuevoAdmin.usuario || !this.nuevoAdmin.contrasena || this.nuevoAdmin.rolId ==null) {
      this.ui.advertencia('Por favor completa: Correo, Contraseña y Rol.');
      return;
    }

    if (!this.nuevoAdmin.nombre || !this.nuevoAdmin.apellido) {
      this.ui.advertencia('Por favor completa: Nombre y Apellido (Requeridos por BD).');
      return;
    }

    // Convertir array de seleccionados a string "USERS,REPORTES"
    const permisosString = this.seccionesDisponibles
      .filter(s => s.seleccionada)
      .map(s => s.key)
      .join(',');

    // 2. Armar el objeto JSON
    const usuarioParaBackend = {
      nombre: this.nuevoAdmin.nombre,
      apellido: this.nuevoAdmin.apellido,
      correo: this.nuevoAdmin.usuario,
      contrasena: this.nuevoAdmin.contrasena,
      telefono: '0987654321',    // Valor por defecto o agrega campo en el HTML
      genero: 'Masculino',       // Valor por defecto o agrega campo en el HTML
      fechaNacimiento: '2000-01-01', // Valor por defecto
      rol: {
        idRol: this.nuevoAdmin.rolId
      },
      ciudad: {
        idCiudad: 1
      },
      permisosUi: permisosString,
      estadoValidacion: 'Activo'
    };

    console.log('Enviando admin:', usuarioParaBackend);

    // Mostrar loading
    this.isLoading = true;

    // 3. Enviar al Backend usando SOLO el servicio
    this.adminService.crearAdministrador(usuarioParaBackend).subscribe({
      next: (respuesta) => {
        // Como configuramos responseType: text, 'respuesta' será el string del backend
        console.log('Respuesta Backend:', respuesta);

        // Mostrar notificación
        this.ui.exito(respuesta);

        // Esperar a que la notificación sea visible, luego cambiar vista y recargar tabla
        setTimeout(() => {
          this.cancelarCreacion(); // Vuelve a la lista y limpia
          this.isLoading = true; // Mostrar loading mientras recarga tabla
          this.adminService.notificarCambio(); // Recarga la tabla desde BD
        }, 500);
      },
      error: (error) => {
        console.error('Error HTTP:', error);
        // Si el backend devuelve texto error, a veces viene en error.error.text o error.error
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

        this.isLoading = true;
        this.adminService.cambiarEstadoAdmin(admin.id, nuevoEstado).subscribe({
          next: (respuesta) => {
            console.log(respuesta);
            this.ui.exito('Estado actualizado exitosamente');

            // Actualizar instantáneamente y recargar tabla desde BD
            setTimeout(() => {
              this.adminService.notificarCambio();
            }, 300);
          },
          error: (e) => {
            console.error(e);
            this.ui.error('Error al cambiar el estado. Revisa la consola.');
            this.isLoading = false;
          }
        });
      });
      return;
    }

    this.isLoading = true;
    this.adminService.cambiarEstadoAdmin(admin.id, nuevoEstado).subscribe({
      next: (respuesta) => {
        console.log(respuesta);
        this.ui.exito('Estado actualizado exitosamente');

        // Actualizar instantáneamente y recargar tabla desde BD
        setTimeout(() => {
          this.adminService.notificarCambio();
        }, 300);
      },
      error: (e) => {
        console.error(e);
        this.ui.error('Error al cambiar el estado. Revisa la consola.');
        this.isLoading = false;
      }
    });
  }

  // Helpers para paginación
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.listaAdmins.length / this.pageSize));
  }

  get adminsPagina() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.listaAdmins.slice(start, start + this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  goToPage(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.currentPage = n;
      this.cdr.detectChanges();
    }
  }

  get displayStart(): number {
    if (this.listaAdmins.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.listaAdmins.length);
  }

  formatEstado(admin: any): string {
    const val = admin?.estadoValidacion;
    if (!val) return 'Pendiente';
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  }

  private limpiarFormulario() {
    this.nuevoAdmin = { usuario: '', contrasena: '', rolId: null, nombre: '', apellido: '' };
    this.seccionesDisponibles.forEach(s => s.seleccionada = false);
  }

  desactivarUsuario(admin: any) {
    this.confirmService.abrir(`¿Estás seguro de desactivar al usuario ${admin.usuario}?`).then(acepto => {
      if (!acepto) return;

      this.isLoading = true;
      this.adminService.cambiarEstadoAdmin(admin.id, 'Inactivo').subscribe({
        next: (respuesta) => {
          this.ui.info(respuesta);

          // Recargar tabla desde BD
          setTimeout(() => {
            this.adminService.notificarCambio();
          }, 300);
        },
        error: (e) => {
          console.error(e);
          this.ui.error('Error al desactivar usuario');
          this.isLoading = false;
        }
      });
    });
  }
}
