import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../perfil.service';

interface DetalleCargo {
  id_cargo: number | null;
  nombre_cargo: string;
}

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

  // Lista de cargos temporales para esta experiencia
  cargosTemporales: DetalleCargo[] = [];

  // Cargo actual en el formulario
  cargoActual: number | null = null;

  // Objeto temporal para el formulario de "Agregar Nuevo"
  nuevaExperiencia = {
    id_empresa_catalogo: null,
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

  // Agregar cargo a la lista temporal
  agregarCargoTemporal(): void {
    if (this.cargoActual) {
      // Verificar si el cargo ya está en la lista
      const yaExiste = this.cargosTemporales.some(c => c.id_cargo === this.cargoActual);

      if (yaExiste) {
        alert('Este cargo ya está agregado a la lista');
        return;
      }

      const cargo = this.cargosDisponibles.find(c => c.idCargo == this.cargoActual);

      if (cargo) {
        this.cargosTemporales.push({
          id_cargo: cargo.idCargo,
          nombre_cargo: cargo.nombreCargo
        });

        // Limpiar el select
        this.cargoActual = null;
      }
    } else {
      alert('Por favor seleccione un cargo');
    }
  }

  // Eliminar cargo de la lista temporal
  eliminarCargoTemporal(index: number): void {
    this.cargosTemporales.splice(index, 1);
  }

  agregarExperiencia(): void {
    // Validación de campos obligatorios
    if (this.cargosTemporales.length === 0) {
      alert('Debe agregar al menos un cargo a la experiencia');
      return;
    }

    if (!this.nuevaExperiencia.id_empresa_catalogo ||
      !this.nuevaExperiencia.fecha_inicio ||
      !this.nuevaExperiencia.descripcion) {
      alert('Por favor complete los campos obligatorios: Empresa, Fecha Inicio y Descripción');
      return;
    }

    const empresa = this.empresasDisponibles.find(e => e.idEmpresaCatalogo == this.nuevaExperiencia.id_empresa_catalogo);

    // Crear un registro de experiencia por cada cargo
    this.cargosTemporales.forEach(cargo => {
      this.perfil.experiencias.push({
        id_cargo: cargo.id_cargo,
        id_empresa_catalogo: this.nuevaExperiencia.id_empresa_catalogo,
        nombre_cargo: cargo.nombre_cargo,
        nombre_empresa: empresa ? empresa.nombreEmpresa : '',
        descripcion: this.nuevaExperiencia.descripcion,
        fecha_inicio: this.nuevaExperiencia.fecha_inicio,
        fecha_fin: this.nuevaExperiencia.fecha_fin,
        fecha_registro: this.nuevaExperiencia.fecha_registro || new Date().toISOString().split('T')[0],
        ubicacion: this.nuevaExperiencia.ubicacion,
        archivo_comprobante: this.nuevaExperiencia.archivo_comprobante,
        nombreArchivo: this.nuevaExperiencia.nombreArchivo
      });
    });

    // Reset del formulario y lista temporal
    this.resetFormulario();
    this.datosCambiados.emit();
  }

  resetFormulario(): void {
    this.nuevaExperiencia = {
      id_empresa_catalogo: null,
      nombre_empresa: '',
      archivo_comprobante: null,
      nombreArchivo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      fecha_registro: '',
      ubicacion: ''
    };
    this.cargosTemporales = [];
    this.cargoActual = null;
  }

  eliminarExperiencia(index: number): void {
    this.perfil.experiencias.splice(index, 1);
    this.datosCambiados.emit();
  }
}
