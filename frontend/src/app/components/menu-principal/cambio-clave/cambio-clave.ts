import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../Panel-Admin/services/admin.service';
import {ConfirmService} from '../../../services/confirm.service';

@Component({
  selector: 'app-cambio-clave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambio-clave.html',
  styleUrls: ['./cambio-clave.css']
})
export class CambioClaveComponent {
  // Datos del formulario
  datos = {
    actual: '',
    nueva: '',
    confirmacion: ''
  };

  // Visibilidad de contraseñas (el ojito)
  showActual = false;
  showNueva = false;
  showConf = false;

  // Estados
  isLoading = false;
  mensajeExito = '';
  mensajeError = '';

  // 🔥 NUEVO: Inyectamos el AdminService en el constructor
  constructor(
    private location: Location,
    private adminService: AdminService,
    private confirmService: ConfirmService
  ) {}

  cancelar() {
    this.location.back(); // Simula el botón "Atrás" del navegador
  }

  cambiarClave() {
    // Validaciones con Modal de Advertencia
    if (!this.datos.actual || !this.datos.nueva || !this.datos.confirmacion) {
      this.confirmService.abrir('Por favor, completa todos los campos antes de continuar.', 'Campos Incompletos', 'advertencia');
      return;
    }

    if (this.datos.nueva.length < 8) {
      this.confirmService.abrir('Por tu seguridad, la nueva contraseña debe tener al menos 8 caracteres.', 'Contraseña Insegura', 'advertencia');
      return;
    }

    if (this.datos.nueva !== this.datos.confirmacion) {
      this.confirmService.abrir('La nueva contraseña y la confirmación no coinciden. Verifica e intenta de nuevo.', 'Las claves no coinciden', 'advertencia');
      return;
    }

    if (this.datos.actual === this.datos.nueva) {
      this.confirmService.abrir('La nueva contraseña no puede ser igual a tu clave actual.', 'Clave Inválida', 'advertencia');
      return;
    }

    // Obtenemos el ID del usuario
    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
      this.confirmService.abrir('No se pudo identificar tu sesión. Por favor, vuelve a iniciar sesión.', 'Error de Autenticación', 'advertencia');
      return;
    }

    this.isLoading = true;

    const payload = {
      claveActual: this.datos.actual,
      nuevaClave: this.datos.nueva
    };

    // Consumimos el servicio real
    this.adminService.cambiarClave(idUsuario, payload).subscribe({
      next: (res: any) => {
        // 🔥 FIX NG0100: Retrasamos un microsegundo el cambio de estado para que Angular renderice en paz
        setTimeout(() => {
          this.isLoading = false;
          this.datos = { actual: '', nueva: '', confirmacion: '' };
        }, 0);

        // Modal de Éxito
        this.confirmService.abrir(
          res.mensaje || 'Tu contraseña ha sido actualizada correctamente. Usa tu nueva clave en tu próximo inicio de sesión.',
          '¡Cambio Exitoso!',
          'exito'
        ).then(() => {
          // Nos vamos de la pantalla solo cuando el usuario le da "Aceptar"
          this.location.back();
        });
      },
      error: (err: any) => {
        // 🔥 FIX NG0100 en caso de error
        setTimeout(() => {
          this.isLoading = false;
        }, 0);

        console.error('Error al cambiar la clave:', err);
        const mensajeBackend = err.error?.error || 'Ocurrió un error al intentar cambiar la contraseña.';

        // Modal de Advertencia con el mensaje que devuelve Spring Boot
        this.confirmService.abrir(mensajeBackend, 'No se pudo actualizar', 'advertencia');
      }
    });
  }

  mostrarError(msg: string) {
    this.mensajeError = msg;
    setTimeout(() => this.mensajeError = '', 4000);
  }

  mostrarExito(msg: string) {
    this.mensajeExito = msg;
    setTimeout(() => this.mensajeExito = '', 4000);
  }
}
