import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../services/ui-notification.service';
import { DocumentoPdfRef, refDocumento } from '../../../utils/documento-storage-url';
@Component({
  selector: 'app-seccion-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-idiomas.html',
  styleUrls: ['./seccion-idiomas.css', '../perfil-secciones-shared.css']
})
export class SeccionIdiomasComponent {
  @Input() idiomas: any[] = [];
  @Input() idiomasDisponibles: any[] = [];
  @Input() niveles: string[] = [];

  @Output() onGuardarIdioma = new EventEmitter<{formData: FormData, idEdicion: number | null}>();
  @Output() onEliminar = new EventEmitter<{index: number, id: number}>();
  @Output() onVerPdf = new EventEmitter<DocumentoPdfRef>();

  @ViewChild('fileInputIdm') fileInputIdm!: ElementRef;

  modalIdioma = signal(false);
  idEdicionIdioma: number | null = null;
  nuevoIdioma: any = {id_idioma: null, nivel: null, archivo: null, nombreArchivo: ''};


  constructor(private ui: UiNotificationService) {}

  abrirModal() {
    if (!this.idEdicionIdioma) {
      this.nuevoIdioma = { id_idioma: null, nivel: null, archivo: null, nombreArchivo: '' };
    }
    this.modalIdioma.set(true);
  }

  cerrarModal() {
    this.modalIdioma.set(false);
    this.idEdicionIdioma = null;
    this.nuevoIdioma = {id_idioma: null, nivel: null, archivo: null, nombreArchivo: ''};
  }

  editar(idioma: any) {
    this.idEdicionIdioma = idioma.id_usuario_idioma;
    this.nuevoIdioma = {
      id_idioma: idioma.id_idioma,
      nivel: idioma.nivel,
      archivo: null,
      nombreArchivo: idioma.nombreArchivo
    };
    this.abrirModal();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {

      this.ui.error('El archivo es muy pesado. El límite máximo permitido es de 20 MB.');

      event.target.value = '';
      this.nuevoIdioma.archivo = null;
      this.nuevoIdioma.nombreArchivo = '';
      return;
    }

    if (file.type !== 'application/pdf') {

      this.ui.advertencia('Por favor, sube únicamente archivos en formato PDF.');
      event.target.value = '';
      return;
    }

    this.nuevoIdioma.archivo = file;
    this.nuevoIdioma.nombreArchivo = file.name;
  }

  prepararGuardado(): void {
    if (!this.nuevoIdioma.id_idioma || !this.nuevoIdioma.nivel) {
      this.ui.advertencia('⚠️ Selecciona un idioma y nivel primero.');
      return;
    }

    const formData = new FormData();
    formData.append('idIdioma', this.nuevoIdioma.id_idioma.toString());
    formData.append('nivel', this.nuevoIdioma.nivel);
    if (this.nuevoIdioma.archivo) formData.append('archivo', this.nuevoIdioma.archivo);

    this.onGuardarIdioma.emit({ formData: formData, idEdicion: this.idEdicionIdioma });
    this.cerrarModal();
  }

  verPdfIdioma(item: { nombreArchivo?: string; nombre_idioma?: string }): void {
    if (!item?.nombreArchivo) return;
    this.onVerPdf.emit(refDocumento(item.nombreArchivo, `Certificado_${item.nombre_idioma || 'Idioma'}`));
  }
}
