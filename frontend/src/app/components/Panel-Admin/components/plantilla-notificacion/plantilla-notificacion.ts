import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantillaNotificacionService } from '../../services/plantilla-notificacion.service';

export interface PlantillaDTO {
  idPlantilla: number;
  tipo: string;
  titulo: string;
  contenido: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface VariableTemplate {
  nombre: string;
  descripcion: string;
}

export interface HistorialItem {
  idHistorial: number;
  adminNombre: string;
  adminEmail: string;
  accion: string;
  tituloAnterior: string;
  tituloNuevo: string;
  contenidoAnterior: string;
  contenidoNuevo: string;
  fechaCreacion: string;
  ipAddress?: string;
}

// Variables disponibles por tipo de plantilla (hardcoded)
const VARIABLES_POR_TIPO: { [key: string]: VariableTemplate[] } = {
  'EMAIL_CORREO_ACTUALIZADO': [
    { nombre: 'adminNombre', descripcion: 'Nombre del administrador que realizó el cambio' },
    { nombre: 'correoAnterior', descripcion: 'Dirección de correo anterior' },
    { nombre: 'correoNuevo', descripcion: 'Dirección de correo nueva' },
    { nombre: 'fecha', descripcion: 'Fecha y hora del cambio' }
  ],
  'EMAIL_POSTULACION_RECIBIDA': [
    { nombre: 'nombrePostulante', descripcion: 'Nombre del postulante' },
    { nombre: 'tituloPuesto', descripcion: 'Título del puesto' },
    { nombre: 'empresa', descripcion: 'Nombre de la empresa' },
    { nombre: 'fecha', descripcion: 'Fecha de postulación' }
  ],
  'IN_APP_POSTULACION_RECIBIDA': [
    { nombre: 'nombrePostulante', descripcion: 'Nombre del postulante' },
    { nombre: 'tituloPuesto', descripcion: 'Título del puesto' },
    { nombre: 'empresa', descripcion: 'Nombre de la empresa' }
  ]
};

@Component({
  selector: 'app-plantilla-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plantilla-notificacion.html',
  styleUrls: ['./plantilla-notificacion.css']
})
export class PlantillaNotificacionComponent implements OnInit {
  plantillas: PlantillaDTO[] = [];
  plantillaSeleccionada: PlantillaDTO | null = null;
  historial: HistorialItem[] = [];
  variablesDisponibles: VariableTemplate[] = [];

  tituloEditado: string = '';
  contenidoEditado: string = '';

  cargando: boolean = true;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  expandidoHistorial: { [key: number]: boolean } = {};

  constructor(
    private plantillaService: PlantillaNotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    this.cargando = true;
    this.plantillaService.obtenerPlantillas().subscribe({
      next: (plantillas: PlantillaDTO[]) => {
        this.plantillas = plantillas;
        if (plantillas.length > 0) {
          this.seleccionarPlantilla(plantillas[0]);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando plantillas:', err);
        this.mensajeError = 'Error al cargar plantillas';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarPlantilla(plantilla: PlantillaDTO): void {
    this.plantillaSeleccionada = plantilla;
    this.tituloEditado = plantilla.titulo;
    this.contenidoEditado = plantilla.contenido;
    this.mensajeExito = '';
    this.mensajeError = '';

    // Obtener variables según el tipo de plantilla
    this.variablesDisponibles = VARIABLES_POR_TIPO[plantilla.tipo] || [];

    this.cargarHistorial();
  }

  cargarHistorial(): void {
    if (!this.plantillaSeleccionada) return;

    this.plantillaService.obtenerHistorial(this.plantillaSeleccionada.idPlantilla).subscribe({
      next: (data: HistorialItem[]) => {
        this.historial = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando historial:', err);
      }
    });
  }

  guardarCambios(): void {
    if (!this.plantillaSeleccionada) return;

    if (!this.tituloEditado || !this.tituloEditado.trim()) {
      this.mensajeError = '❌ El título no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    if (!this.contenidoEditado || !this.contenidoEditado.trim()) {
      this.mensajeError = '❌ El contenido no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    if (this.tituloEditado === this.plantillaSeleccionada.titulo &&
        this.contenidoEditado === this.plantillaSeleccionada.contenido) {
      this.mensajeError = '❌ No hay cambios para guardar';
      this.mensajeExito = '';
      return;
    }

    this.guardando = true;
    const idUsuario = localStorage.getItem('idUsuario');

    this.plantillaService.actualizarPlantilla(
      this.plantillaSeleccionada.idPlantilla,
      this.tituloEditado,
      this.contenidoEditado,
      idUsuario
    ).subscribe({
      next: (response: any) => {
        if (response.exito) {
          this.mensajeExito = response.mensaje;
          this.plantillaSeleccionada!.titulo = this.tituloEditado;
          this.plantillaSeleccionada!.contenido = this.contenidoEditado;
          this.cargarHistorial();
        } else {
          this.mensajeError = response.mensaje;
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.mensajeError = '❌ Error al guardar: ' + (err.error?.mensaje || err.message);
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelarCambios(): void {
    if (!this.plantillaSeleccionada) return;
    this.tituloEditado = this.plantillaSeleccionada.titulo;
    this.contenidoEditado = this.plantillaSeleccionada.contenido;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  toggleHistorial(idHistorial: number): void {
    this.expandidoHistorial[idHistorial] = !this.expandidoHistorial[idHistorial];
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
}
