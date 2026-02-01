import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {PerfilService} from '../../perfil.service';

@Component({
  selector: 'app-info-academica',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // 👈 Agrégalo aquí para habilitar [(ngModel)]
  ],
  templateUrl: './info-academica.html',
  styleUrls: ['./info-academica.css']
})

export class InfoAcademicaComponent implements OnInit {
  @Input() perfil: any; // Debe contener: perfil.titulos = []
  @Output() datosCambiados = new EventEmitter<void>();

  facultades: any[] = [];
  // Almacenamos las carreras por cada índice para que no se mezclen
  carrerasPorTitulo: any[][] = [];

  constructor(private perfilService: PerfilService) {}

  ngOnInit() {
    this.perfilService.getFacultades().subscribe(data => {
      this.facultades = data;
      // Inicializar carreras si ya existen títulos guardados
      if (this.perfil.titulos) {
        this.perfil.titulos.forEach((titulo: any, index: number) => {
          if (titulo.id_facultad) this.cargarCarreras(titulo.id_facultad, index);
        });
      }
    });
  }
  // 📂 1. Captura el archivo seleccionado del explorador
  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      // Guardamos el nombre para mostrarlo en la interfaz
      this.perfil.titulos[index].nombreArchivo = file.name;
      // Guardamos el archivo real para subirlo al backend después
      this.perfil.titulos[index].archivoReferencia = file;
      this.onInputChange();
    }
  }

  agregarTitulo(): void {
    if (!this.perfil.titulos) this.perfil.titulos = [];
    this.perfil.titulos.push({
      id_facultad: null,
      id_carrera: null,
      fechaGraduacion: '',
      registroSenescyt: ''
    });
    this.onInputChange();
  }

  eliminarTitulo(index: number): void {
    this.perfil.titulos.splice(index, 1);
    this.carrerasPorTitulo.splice(index, 1);
    this.onInputChange();
  }

  onFacultadChange(index: number): void {
    const idFacultad = this.perfil.titulos[index].id_facultad;
    if (idFacultad) {
      this.perfil.titulos[index].id_carrera = null;
      this.cargarCarreras(idFacultad, index);
    } else {
      this.carrerasPorTitulo[index] = [];
    }
    this.onInputChange();
  }

  private cargarCarreras(idFacultad: number, index: number): void {
    this.perfilService.getCarrerasPorFacultad(idFacultad).subscribe(data => {
      this.carrerasPorTitulo[index] = data;
    });
  }

  onInputChange(): void {
    this.datosCambiados.emit();
  }
}
