import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Asegúrate de importar tus servicios correctamente según la ruta de tu proyecto
import { PerfilService } from '../../../perfil-profesional/perfil.service';
import { UiNotificationService } from '../../../../services/ui-notification.service';

@Component({
  selector: 'app-perfil-x',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-x.html',
  styleUrl: './perfil-x.css',
})
export class InformacionPersonalComponent implements OnInit {

  // --- DATOS DEL USUARIO ---
  perfil: any = {
    nombreCompleto: '',
    fechaNacimiento: '',
    genero: '',
    correo: '',
    telefono: '',
    id_provincia: null,
    id_ciudad: null
  };

  // --- ESTADOS DE LA INTERFAZ ---
  rol: string = 'Postulante';
  completitudPerfil: number = 0;
  fotoUrl: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;
  idUsuarioLogueado: number = 0;

  // --- CATÁLOGOS ---
  provincias: any[] = [];
  ciudades: any[] = [];

  constructor(
    private perfilService: PerfilService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notif: UiNotificationService
  ) {}

  ngOnInit(): void {
    const idLocal = localStorage.getItem('idUsuario');
    if (idLocal) {
      this.idUsuarioLogueado = Number(idLocal);
      this.cargarProvincias();
      this.cargarDatosDesdeBackend();
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ==========================================
  // CARGA DE DATOS (Backend)
  // ==========================================

  cargarProvincias(): void {
    this.perfilService.obtenerProvincias().subscribe({
      next: (res: any[]) => { this.provincias = res; },
      error: (err: any) => console.warn('Error cargando provincias', err)
    });
  }

  cargarDatosDesdeBackend(): void {
    this.perfilService.obtenerDatosUsuario(this.idUsuarioLogueado).subscribe({
      next: (data: any) => {
        if (!data) return;

        // Mapeo de datos para el formulario
        this.perfil.nombreCompleto = `${data.nombre || ''} ${data.apellido || ''}`.trim();
        this.perfil.correo = data.correo || '';
        this.perfil.telefono = data.telefono || '';
        this.perfil.genero = data.genero || '';
        this.perfil.fechaNacimiento = data.fechaNacimiento || '';
        this.fotoUrl = data.urlFotoPerfil || null;
        this.perfil.id_provincia = data.idProvincia || null;
        this.perfil.id_ciudad = data.idCiudad || null;

        // Si ya tiene provincia, cargamos las ciudades correspondientes
        if (this.perfil.id_provincia) {
          this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe((res: any[]) => {
            this.ciudades = res;
            this.cdr.detectChanges();
          });
        }

        this.actualizarProgreso();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar datos del usuario', err)
    });
  }

  // ==========================================
  // EVENTOS DEL FORMULARIO
  // ==========================================

  onInputChange(): void {
    this.actualizarProgreso();
  }

  onProvinciaChange(): void {
    this.perfil.id_ciudad = null; // Reiniciar ciudad al cambiar provincia
    if (this.perfil.id_provincia) {
      this.perfilService.getCiudadesPorProvincia(this.perfil.id_provincia).subscribe((res: any[]) => {
        this.ciudades = res;
        this.cdr.detectChanges();
      });
    } else {
      this.ciudades = [];
    }
    this.actualizarProgreso();
  }

  // ==========================================
  // LÓGICA DE FOTO DE PERFIL
  // ==========================================

  seleccionarImagen(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;

      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fotoUrl = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(archivo);

      // Subir al instante
      this.subirImagen();
    }
  }

  subirImagen() {
    if (this.archivoSeleccionado && this.idUsuarioLogueado) {
      this.perfilService.subirLogoProfesional(this.idUsuarioLogueado, this.archivoSeleccionado).subscribe({
        next: (respuesta: any) => {
          this.fotoUrl = respuesta.urlImagen; // Actualizar con la URL final del backend
          this.notif.exito('Foto de perfil actualizada.');
          this.actualizarProgreso();
          this.cdr.detectChanges();
        },
        error: (err: any) => this.notif.error('No se pudo guardar la imagen.')
      });
    }
  }

  // ==========================================
  // LÓGICA DE GUARDADO Y PROGRESO
  // ==========================================

  actualizarProgreso(): void {
    let camposCompletados = 0;

    // Solo tomamos en cuenta los campos de esta vista para el 100% de esta sección
    const camposObligatorios = [
      this.perfil.nombreCompleto,
      this.perfil.fechaNacimiento,
      this.perfil.genero,
      this.perfil.correo,
      this.perfil.telefono,
      this.perfil.id_provincia,
      this.perfil.id_ciudad
    ];

    camposObligatorios.forEach(campo => {
      if (campo !== null && campo !== undefined && campo.toString().trim() !== '') {
        camposCompletados++;
      }
    });

    // Sumamos la foto como un campo más
    if (this.fotoUrl) camposCompletados++;

    const total = camposObligatorios.length + 1; // 7 campos + 1 foto

    // Calcula el porcentaje
    this.completitudPerfil = Math.round((camposCompletados / total) * 100);
  }

  guardarDatosPersonales(): void {
    if (!this.perfil.nombreCompleto || !this.perfil.correo) {
      this.notif.advertencia('El nombre completo y el correo son obligatorios.');
      return;
    }

    // Armamos el payload exacto que espera tu backend (revisa los nombres de las variables)
    const payload = {
      nombreCompleto: this.perfil.nombreCompleto,
      fechaNacimiento: this.perfil.fechaNacimiento,
      genero: this.perfil.genero,
      telefono: this.perfil.telefono,
      idCiudad: this.perfil.id_ciudad
    };

    this.perfilService.actualizarDatosPersonales(this.idUsuarioLogueado, payload).subscribe({
      next: (res: any) => {
        this.notif.exito('Datos personales guardados exitosamente.');
        this.actualizarProgreso();
        this.cdr.detectChanges();
      },
      error: (err: any) => this.notif.error('Hubo un error al guardar tu información.')
    });
  }
}
