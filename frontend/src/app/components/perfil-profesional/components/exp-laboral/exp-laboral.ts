import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../perfil.service';

@Component({
  selector: 'app-experiencia-laboral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exp-laboral.html',
  styleUrls: ['./exp-laboral.css']
})
export class ExperienciaLaboralComponent implements OnInit {
  @Input() perfil: any; // Debe contener: perfil.experiencias = []
  @Output() datosCambiados = new EventEmitter<void>();

  cargosDisponibles: any[] = []; // Se cargan desde el backend
  empresasDisponibles: any[] = []; // Se cargan desde el backend

  // Objeto temporal para el formulario de "Agregar Nuevo"
  nuevaExperiencia = {
    id_cargo: null,
    id_empresa_catalogo: null,
    nombre_cargo: '',
    nombre_empresa: '',
    archivo_comprobante: null,
    nombreArchivo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_registro: '',
    ubicacion: ''
  };

  constructor(private perfilService: PerfilService) {}

  ngOnInit() {
    // Inicializar el arreglo si no existe
    if (!this.perfil.experiencias) {
      this.perfil.experiencias = [];
    }

    // Cargar catálogos de cargos y empresas
    this.perfilService.getCargosCatalogo().subscribe(data => {
      this.cargosDisponibles = data;
    });

    this.perfilService.getEmpresasCatalogo().subscribe(data => {
      this.empresasDisponibles = data;
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nuevaExperiencia.archivo_comprobante = file;
      this.nuevaExperiencia.nombreArchivo = file.name;
    }
  }

  agregarExperiencia(): void {
    if (this.nuevaExperiencia.id_cargo && this.nuevaExperiencia.id_empresa_catalogo &&
      this.nuevaExperiencia.fecha_inicio && this.nuevaExperiencia.descripcion) {

      const cargo = this.cargosDisponibles.find(c => c.idCargo == this.nuevaExperiencia.id_cargo);
      const empresa = this.empresasDisponibles.find(e => e.idEmpresa == this.nuevaExperiencia.id_empresa_catalogo);

      // Agregamos al arreglo perfil.experiencias para que se vea en la lista
      this.perfil.experiencias.push({
        id_cargo: this.nuevaExperiencia.id_cargo,
        id_empresa_catalogo: this.nuevaExperiencia.id_empresa_catalogo,
        nombre_cargo: cargo ? cargo.nombreCargo : '',
        nombre_empresa: empresa ? empresa.nombreEmpresa : '',
        descripcion: this.nuevaExperiencia.descripcion,
        fecha_inicio: this.nuevaExperiencia.fecha_inicio,
        fecha_fin: this.nuevaExperiencia.fecha_fin,
        fecha_registro: this.nuevaExperiencia.fecha_registro || new Date().toISOString().split('T')[0],
        ubicacion: this.nuevaExperiencia.ubicacion,
        archivo_comprobante: this.nuevaExperiencia.archivo_comprobante,
        nombreArchivo: this.nuevaExperiencia.nombreArchivo
      });

      // Reset del formulario
      this.nuevaExperiencia = {
        id_cargo: null,
        id_empresa_catalogo: null,
        nombre_cargo: '',
        nombre_empresa: '',
        archivo_comprobante: null,
        nombreArchivo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        fecha_registro: '',
        ubicacion: ''
      };

      this.datosCambiados.emit();
    } else {
      alert('Por favor complete los campos obligatorios: Cargo, Empresa, Fecha Inicio y Descripción');
    }
  }

  eliminarExperiencia(index: number): void {
    this.perfil.experiencias.splice(index, 1);
    this.datosCambiados.emit();
  }
}
