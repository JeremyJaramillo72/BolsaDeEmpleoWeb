import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-admin-mini-admi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mini-admi.html',
  styleUrls: ['./admin-mini-admi.css'],
  // providers: [AdminService] <--- NO es necesario si el servicio tiene providedIn: 'root'
})
export class AdminMiniAdmiComponent implements OnInit {

  vistaActual: 'LISTA' | 'CREAR' = 'LISTA';
  listaAdmins: any[] = [];

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

  // Eliminamos 'private http: any' porque usaremos solo el servicio

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.cargarListaAdminsRegistrados();
    this.cargarRolesInternos();

  }
  cargarListaAdminsRegistrados()
  {
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
        },
        error: (e) => console.error('Error cargando lista de admins:', e)
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
      alert('Por favor completa: Correo, Contraseña y Rol.');
      return;
    }

    if (!this.nuevoAdmin.nombre || !this.nuevoAdmin.apellido) {
      alert('Por favor completa: Nombre y Apellido (Requeridos por BD).');
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

    // 3. Enviar al Backend usando SOLO el servicio
    this.adminService.crearAdministrador(usuarioParaBackend).subscribe({
      next: (respuesta) => {
        // Como configuramos responseType: text, 'respuesta' será el string del backend
        console.log('Respuesta Backend:', respuesta);
        alert(respuesta); // Muestra "Usuario creado con éxito..."

        // Actualizar lista local (visual)
        const nombresPermisos = this.seccionesDisponibles
          .filter(s => s.seleccionada)
          .map(s => s.nombre);

        this.listaAdmins.push({
          usuario: this.nuevoAdmin.usuario,
          rolBD: this.rolesDisponibles.find(r => r.id == this.nuevoAdmin.rolId)?.etiqueta,
          fechaCreacion: new Date(),
          permisosUI: nombresPermisos.length > 0 ? nombresPermisos : ['Sin Permisos UI'],
          estadoValidacion: 'Activo'
        });

        this.cancelarCreacion(); // Vuelve a la lista y limpia
      },
      error: (error) => {
        console.error('Error HTTP:', error);
        // Si el backend devuelve texto error, a veces viene en error.error.text o error.error
        const mensaje = error.error?.text || error.error || error.message;
        alert('Ocurrió un error: ' + mensaje);
      }
    });
  }

  toggleEstado(admin: any) {
    const estadoActual = admin.estadoValidacion;
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    if (nuevoEstado === 'Inactivo') {
      if(!confirm(`¿Seguro que deseas desactivar a ${admin.usuario}?`)) return;
    }

    // 2. Llamar al Backend
    this.adminService.cambiarEstadoAdmin(admin.id, nuevoEstado).subscribe({
      next: (respuesta) => {
        console.log(respuesta); // "Estado actualizado a Activo/Inactivo"

        // 3. ¡Magia! Actualizamos la vista inmediatamente sin recargar la página
        admin.estadoValidacion = nuevoEstado;
      },
      error: (e) => {
        console.error(e);
        alert('Error al cambiar el estado. Revisa la consola.');
      }
    });
  }

  private limpiarFormulario() {
    this.nuevoAdmin = { usuario: '', contrasena: '', rolId: null, nombre: '', apellido: '' };
    this.seccionesDisponibles.forEach(s => s.seleccionada = false);
  }

  desactivarUsuario(admin: any) {
    if (!confirm(`¿Estás seguro de desactivar al usuario ${admin.usuario}?`)) {
      return;
    }
    this.adminService.cambiarEstadoAdmin(admin.id, 'Inactivo').subscribe({
      next: (respuesta) => {
        alert(respuesta);
        admin.estadoValidacion = 'Inactivo';
      },
      error: (e) => {
        console.error(e);
        alert('Error al desactivar usuario');
      }
    });
  }
}
