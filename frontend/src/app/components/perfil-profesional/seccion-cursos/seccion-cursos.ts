import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../services/ui-notification.service';

@Component({
  selector: 'app-seccion-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-cursos.html',
  styleUrls: ['./seccion-cursos.css']
})
export class SeccionCursosComponent {
  @Input() cursos: any[] = [];

  @Output() onGuardarCurso = new EventEmitter<{formData: FormData, idEdicion: number | null}>();
  @Output() onEliminar = new EventEmitter<{index: number, id: number}>();
  @Output() onVerPdf = new EventEmitter<string>();

  @ViewChild('fileInputCurso') fileInputCurso!: ElementRef;

  modalCurso: boolean = false;
  idEdicionCurso: number | null = null;
  nuevoCurso: any = {nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: ''};

  constructor(private cdr: ChangeDetectorRef, private ui: UiNotificationService) {}

  abrirModal() {
    this.modalCurso = true;
  }

  cerrarModal() {
    this.modalCurso = false;
    this.idEdicionCurso = null;
    this.nuevoCurso = {nombre_curso: '', institucion: '', horas_duracion: null, archivo: null, nombreArchivo: ''};
  }

  editar(curso: any) {
    this.idEdicionCurso = curso.id_curso;
    this.nuevoCurso = {
      nombre_curso: curso.nombre_curso,
      institucion: curso.institucion,
      horas_duracion: curso.horas_duracion,
      archivo: null,
      nombreArchivo: curso.nombreArchivo
    };
    this.abrirModal();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      this.ui.error('⚠️ El certificado es muy pesado. El límite máximo permitido es de 20 MB.');
      event.target.value = '';
      this.nuevoCurso.archivo = null;
      this.nuevoCurso.nombreArchivo = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      this.ui.advertencia('⚠️ Por favor, sube el certificado únicamente en formato PDF.');
      event.target.value = '';
      return;
    }

    this.nuevoCurso.archivo = file;
    this.nuevoCurso.nombreArchivo = file.name;
  }

  prepararGuardado(): void {
    if (!this.nuevoCurso.nombre_curso || !this.nuevoCurso.institucion) {
      this.ui.advertencia('⚠️ El nombre del curso y la institución son obligatorios.');
      return;
    }

    if (this.nuevoCurso.horas_duracion !== null && this.nuevoCurso.horas_duracion <= 0) {
      this.ui.advertencia('⚠️ Las horas de duración deben ser mayores a cero.');
      return;
    }

    const formData = new FormData();
    formData.append('nombreCurso', this.nuevoCurso.nombre_curso);
    formData.append('institucion', this.nuevoCurso.institucion);

    if (this.nuevoCurso.horas_duracion) {
      formData.append('horasDuracion', this.nuevoCurso.horas_duracion.toString());
    }
    if (this.nuevoCurso.archivo) {
      formData.append('archivo', this.nuevoCurso.archivo);
    }

    this.onGuardarCurso.emit({ formData: formData, idEdicion: this.idEdicionCurso });
    this.cerrarModal();
  }
}
