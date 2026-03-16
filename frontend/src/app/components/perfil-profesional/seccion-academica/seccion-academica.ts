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
    this.nuevoTitulo = { id_facultad: null, id_carrera: null, fechaGraduacion: '', registroSenescyt: '', archivoReferencia: null, nombreArchivo: '' };
  }

  onFacultadSelect() {
    this.nuevoTitulo.id_carrera = null;
    if (this.nuevoTitulo.id_facultad) {
      this.onCambioFacultad.emit(this.nuevoTitulo.id_facultad);
    }
  }

  editar(titulo: any) {
    this.idEdicionAcademica = titulo.id_academico;
    this.nuevoTitulo = {
      id_facultad: titulo.id_facultad,
      id_carrera: titulo.id_carrera,
      fechaGraduacion: titulo.fechaGraduacion,
      registroSenescyt: titulo.registroSenescyt,
      archivoReferencia: null,
      nombreArchivo: titulo.nombreArchivo
    };

    if (titulo.id_facultad) {
      this.onCambioFacultad.emit(titulo.id_facultad);
    }

    this.abrirModal();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      this.ui.error('⚠️ El archivo es muy pesado. El límite máximo permitido es de 20 MB.');
      event.target.value = '';
      this.nuevoTitulo.archivoReferencia = null;
      this.nuevoTitulo.nombreArchivo = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      this.ui.advertencia('⚠️ Por favor, sube el documento únicamente en formato PDF.');
      event.target.value = '';
      return;
    }

    this.nuevoTitulo.archivoReferencia = file;
    this.nuevoTitulo.nombreArchivo = file.name;
  }

  prepararGuardado(): void {
    if (!this.nuevoTitulo.id_facultad || !this.nuevoTitulo.id_carrera) {
      this.ui.advertencia('⚠️ Debes seleccionar la facultad y la carrera.');
      return;
    }

    if (!this.nuevoTitulo.fechaGraduacion) {
      this.ui.advertencia('⚠️ La fecha de graduación es obligatoria.');
      return;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const partesFecha = this.nuevoTitulo.fechaGraduacion.split('-');
    const fechaG = new Date(Number(partesFecha[0]), Number(partesFecha[1]) - 1, Number(partesFecha[2]));
    fechaG.setHours(0, 0, 0, 0);

    if (fechaG.getTime() > hoy.getTime()) {
      this.ui.advertencia('⚠️ La fecha de graduación no puede ser en el futuro.');
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
