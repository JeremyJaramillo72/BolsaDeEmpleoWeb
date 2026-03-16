import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../services/ui-notification.service';
@Component({
  selector: 'app-seccion-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seccion-idiomas.html',
  styleUrls: ['./seccion-idiomas.css']
})
export class SeccionIdiomasComponent {
  @Input() idiomas: any[] = [];
  @Input() idiomasDisponibles: any[] = [];
  @Input() niveles: string[] = [];

  @Output() onGuardarIdioma = new EventEmitter<{formData: FormData, idEdicion: number | null}>();
  @Output() onEliminar = new EventEmitter<{index: number, id: number}>();
  @Output() onVerPdf = new EventEmitter<string>();

  @ViewChild('fileInputIdm') fileInputIdm!: ElementRef;

  modalIdioma: boolean = false;
  idEdicionIdioma: number | null = null;
  nuevoIdioma: any = {id_idioma: null, nivel: null, archivo: null, nombreArchivo: ''};


  constructor(private ui: UiNotificationService) {}

  abrirModal() {
    this.modalIdioma = true;
  }

  cerrarModal() {
    this.modalIdioma = false;
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
}
