import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../perfil.service';

@Component({
  selector: 'app-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idiomas.html',
  styleUrls: ['./idiomas.css']
})
export class IdiomasComponent implements OnInit {
  @Input() perfil: any; // Debe contener: perfil.idiomas = []
  @Output() datosCambiados = new EventEmitter<void>();

  idiomasDisponibles: any[] = []; // Se cargan desde el backend
  niveles = ['Nativo', 'C2 - Maestría', 'C1 - Avanzado', 'B2 - Intermedio Alto', 'B1 - Intermedio', 'A2 - Básico', 'A1 - Principiante'];

  // Objeto temporal para el formulario de "Agregar Nuevo"
  nuevoIdioma = {
    id_idioma: null,
    nivel: null,
    nombre_idioma: '',
    archivo: null,
    nombreArchivo: '',
    codigoCertificado: ''
  };

  constructor(private perfilService: PerfilService) {}

  ngOnInit() {
    // Cargamos el catálogo de idiomas (Español, Inglés, etc.)
    this.perfilService.getIdiomasCatalogo().subscribe(data => {
      this.idiomasDisponibles = data;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nuevoIdioma.archivo = file;
      this.nuevoIdioma.nombreArchivo = file.name;
    }
  }

  agregarIdioma(): void {
    if (this.nuevoIdioma.id_idioma && this.nuevoIdioma.nivel) {
      // Buscamos el nombre del idioma para mostrarlo en la lista
      const idiomaSeleccionado = this.idiomasDisponibles.find(i => i.idIdioma == this.nuevoIdioma.id_idioma);

      if (!this.perfil.idiomas) this.perfil.idiomas = [];

      this.perfil.idiomas.push({
        ...this.nuevoIdioma,
        nombre_idioma: idiomaSeleccionado.nombreIdioma
      });

      // Limpiar formulario
      this.nuevoIdioma = { id_idioma: null, nivel: null, nombre_idioma: '', archivo: null, nombreArchivo: '', codigoCertificado: '' };
      this.datosCambiados.emit();
    } else {
      alert('Por favor seleccione un idioma y su nivel');
    }
  }

  eliminarIdioma(index: number): void {
    this.perfil.idiomas.splice(index, 1);
    this.datosCambiados.emit();
  }
}
