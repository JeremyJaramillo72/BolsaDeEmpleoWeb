import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioEmpresaService, UsuarioEmpresaDTO } from '../../services/usuario-empresa.service';
import { UiNotificationService } from '../../services/ui-notification.service';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-empresa.html',
  styleUrls: ['./perfil-empresa.css']
})
export class PerfilEmpresaComponent implements OnInit {

  perfil: UsuarioEmpresaDTO = {
    idUsuario: 0,
    nombre: '',
    descripcion: '',
    ruc: '',
    sitioWeb: '',
    correo: '',
    urlImagen: ''
  };
  porcentajeCompletitud: number = 0;

  constructor(
    private empresaService: UsuarioEmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService
  ) {
  }

  ngOnInit(): void {
    this.cargarDatosDelUsuarioLogueado();
  }

  calcularCompletitud() {
    if (!this.perfil) return;

    let camposLlenos = 0;


    const camposRequeridos = [
      this.perfil.nombre,
      this.perfil.ruc,
      this.perfil.sitioWeb,
      this.perfil.descripcion,
      this.perfil.urlImagen
    ];


    camposRequeridos.forEach(campo => {
      if (campo && campo.toString().trim() !== '') {
        camposLlenos++;
      }
    });

    const totalCampos = camposRequeridos.length;
    this.porcentajeCompletitud = Math.round((camposLlenos / totalCampos) * 100);
  }

  cargarDatosDelUsuarioLogueado() {

    const idGuardado = localStorage.getItem('idUsuario');

    if (idGuardado) {
      const idUsuario = Number(idGuardado);

      console.log('Cargando perfil para el usuario ID:', idUsuario);

      this.empresaService.obtenerPerfilPorUsuario(idUsuario).subscribe({
        next: (data) => {
          this.perfil = data;
          this.calcularCompletitud();
          this.cdr.detectChanges();
          if (!this.perfil.idUsuario) {
            this.perfil.idUsuario = idUsuario;
          }
        },
        error: (e) => {
          console.error('Error al cargar datos:', e);
        }
      });

    } else {
      this.ui.advertencia('No se encontró sesión activa.');
      this.router.navigate(['/login']);
    }
  }


  guardarCambios() {
    if (!this.validarCampos()) {
      return;
    }
    if (this.perfil.idEmpresa) {
      this.empresaService.actualizarPerfil(this.perfil.idEmpresa, this.perfil).subscribe({
        next: () => this.ui.exito('¡Perfil actualizado con éxito!'),
        error: (e) => this.ui.error('Error al actualizar: ' + e.message)
      });
    } else {
      this.ui.advertencia('No se puede actualizar: El perfil no tiene ID de empresa asignado.');
    }
  }

  archivoSeleccionado: File | null = null;


  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;

      this.subirImagen();
    }
  }


  subirImagen() {
    if (this.archivoSeleccionado && this.perfil.idUsuario) {
      this.empresaService.subirLogoEmpresa(this.perfil.idUsuario, this.archivoSeleccionado)
        .subscribe({
          next: (respuesta: any) => {
            console.log('¡Foto subida con éxito!', respuesta);


            this.perfil.urlImagen = respuesta.urlImagen;
            this.calcularCompletitud();
            this.cdr.detectChanges();

            const userStr = localStorage.getItem('user');
            if (userStr) {
              const userObj = JSON.parse(userStr);
              userObj.urlImagen = respuesta.urlImagen;
              localStorage.setItem('user', JSON.stringify(userObj));
            }
            this.ui.exito('Logo actualizado correctamente. Sincronizando...');
            setTimeout(() => {
              window.location.reload();
            }, 1500);

          },
          error: (err) => {
            console.error('Error al subir la foto', err);
            this.ui.error('No se pudo subir la imagen.');
          }
        });
    }
  }

  validarCampos(): boolean {
    const o = this.perfil;
    if (!o.nombre || o.nombre.trim().length < 5) {
      this.ui.advertencia('⚠️ El nombre de la empresa es obligatorio y debe tener al menos 5 caracteres.');
      return false;
    }

    if (!o.descripcion || o.descripcion.trim().length < 5) {
      this.ui.advertencia('⚠️ La descripción es obligatoria y debe ser clara (mínimo 5 caracteres).');
      return false;
    }
    if (!o.sitioWeb || o.sitioWeb.trim().length === 0) {
      this.ui.advertencia('⚠️ El sitio web es obligatorio.');
      return false;
    }
    return true;
  }
}
