import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../services/ui-notification.service';

@Component({
  selector: 'app-seccion-academica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-academica.html',
  styleUrls: ['./seccion-academica.css']
})
export class SeccionAcademicaComponent {
  @Input() titulos: any[] = [];
  @Input() facultades: any[] = [];
  @Input() carrerasNuevoTitulo: any[] = [];

  @Output() onGuardarAcademica = new EventEmitter<{formData: FormData, idEdicion: number | null}>();
  @Output() onEliminar = new EventEmitter<{index: number, id: number}>();
  @Output() onVerPdf = new EventEmitter<string>();
  @Output() onCambioFacultad = new EventEmitter<number>();

  @ViewChild('fileInputAcad') fileInputAcad!: ElementRef;

  modalAcademica: boolean = false;
  idEdicionAcademica: number | null = null;

  nuevoTitulo: any = {
    id_facultad: null,
    id_carrera: null,
    fechaGraduacion: '',
    registroSenescyt: '',
    archivoReferencia: null,
    nombreArchivo: ''
  };

  constructor(private ui: UiNotificationService) {}

  abrirModal() {
    this.modalAcademica = true;
  }

  cerrarModal() {
    this.modalAcademica = false;
    this.idEdicionAcademica = null;
    this.resetFormulario();
  }

  resetFormulario() {
    this.nuevoTitulo = {
      id_facultad: null,
      id_carrera: null,
      fechaGraduacion: '',
      registroSenescyt: '',
      archivoReferencia: null,
      nombreArchivo: ''
    };
  }

  // ✅ Corregido: Ahora se dispara cuando el modelo ya cambió
  onFacultadSelect() {
    this.nuevoTitulo.id_carrera = null;
    if (this.nuevoTitulo.id_facultad) {
      this.onCambioFacultad.emit(Number(this.nuevoTitulo.id_facultad));
    }
  }

  editar(titulo: any) {
    this.idEdicionAcademica = titulo.id_academico;

    // ✅ Mejora: Aseguramos formato YYYY-MM-DD para que el input date no salga vacío
    let fechaLimpia = '';
    if (titulo.fechaGraduacion) {
      fechaLimpia = titulo.fechaGraduacion.toString().split('T')[0];
    }

    this.nuevoTitulo = {
      id_facultad: titulo.id_facultad,
      id_carrera: titulo.id_carrera,
      fechaGraduacion: fechaLimpia,
      registroSenescyt: titulo.registroSenescyt || '',
      archivoReferencia: null,
      nombreArchivo: titulo.nombreArchivo || ''
    };

    if (titulo.id_facultad) {
      this.onCambioFacultad.emit(titulo.id_facultad);
    }

    this.abrirModal();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      this.ui.error('⚠️ El archivo supera los 20 MB permitidos.');
      return;
    }

    if (file.type !== 'application/pdf') {
      this.ui.advertencia('⚠️ Solo se permiten documentos en formato PDF.');
      return;
    }

    this.nuevoTitulo.archivoReferencia = file;
    this.nuevoTitulo.nombreArchivo = file.name;
  }

  prepararGuardado(): void {
    if (!this.nuevoTitulo.id_facultad || !this.nuevoTitulo.id_carrera) {
      this.ui.advertencia('⚠️ Selección de facultad y carrera obligatoria.');
      return;
    }

    if (!this.nuevoTitulo.fechaGraduacion) {
      this.ui.advertencia('⚠️ La fecha de graduación es requerida.');
      return;
    }


    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(this.nuevoTitulo.fechaGraduacion + 'T00:00:00');

    if (fechaSeleccionada > hoy) {
      this.ui.advertencia('⚠️ La fecha de graduación no puede ser futura.');
      return;
    }

    const formData = new FormData();
    formData.append('idCarrera', this.nuevoTitulo.id_carrera.toString());
    formData.append('fechaGraduacion', this.nuevoTitulo.fechaGraduacion);

    if (this.nuevoTitulo.registroSenescyt) {
      formData.append('numeroSenescyt', this.nuevoTitulo.registroSenescyt);
    }

    if (this.nuevoTitulo.archivoReferencia) {
      formData.append('archivo', this.nuevoTitulo.archivoReferencia);
    }

    this.onGuardarAcademica.emit({ formData: formData, idEdicion: this.idEdicionAcademica });
    this.cerrarModal();
  }
}
