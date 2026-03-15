import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo { idFacultad?: number; nombreFacultad?: string; }

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carreras.html',
  styleUrls: ['./carreras.css']
})
export class CarrerasComponent implements OnInit {
  carreras: any[] = [];
  carrerasFiltradas: any[] = [];
  facultadesDisponibles: Catalogo[] = [];
  nuevaCarrera: any = { nombreCarrera: '', idFacultad: null };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarFacultades(); // Es mejor cargar primero las facultades
    this.cargarCarreras();
  }

  cargarCarreras(): void {
    this.adminService.getCarrerasCatalogo().subscribe({
      next: (data) => {
        this.carreras = [...data];
        this.carrerasFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar carreras')
    });
  }

  cargarFacultades(): void {
    this.adminService.getFacultadesCatalogo().subscribe({
      next: (data) => {
        this.facultadesDisponibles = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar facultades')
    });
  }

  onFacultadChange(idFacultad: number): void {
    if (idFacultad) {
      this.adminService.getCarrerasPorFacultad(idFacultad).subscribe({
        next: (data) => {
          this.carrerasFiltradas = [...data];
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.mostrarError('Error al cargar las carreras de esta facultad');
          this.carrerasFiltradas = [];
        }
      });
    } else {
      this.carrerasFiltradas = [...this.carreras];
    }
  }

  editarCarrera(car: any): void {
    this.idEditando = car.idCarrera;
    const idFac = car.facultad ? car.facultad.idFacultad : car.idFacultad;
    this.nuevaCarrera = {
      nombreCarrera: car.nombreCarrera,
      idFacultad: idFac ? Number(idFac) : null // Forzamos a Número para que Angular lo reconozca
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaCarrera = { nombreCarrera: '', idFacultad: null };
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarCarrera(): void {
    const nombreIngresado = this.nuevaCarrera.nombreCarrera?.trim();
    const idFacultadSeleccionada = this.nuevaCarrera.idFacultad;

    if (!nombreIngresado || !idFacultadSeleccionada) {
      this.mostrarError('Complete todos los campos de la carrera');
      return;
    }

    // Validación de duplicados excluyendo el que se está editando
    const existeCarrera = this.carreras.some(
      c => c.nombreCarrera?.toLowerCase() === nombreIngresado.toLowerCase() && c.idCarrera !== this.idEditando
    );

    if (existeCarrera) {
      this.confirmService.abrir(
        `No puedes guardar la carrera con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const carreraActualizada = {
        idCarrera: this.idEditando,
        nombreCarrera: nombreIngresado,
        idFacultad: Number(idFacultadSeleccionada) // Forzamos a número por seguridad
      };

      this.adminService.actualizarCarrera(carreraActualizada).subscribe({
        next: () => {
          this.mostrarExito('Carrera actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarCarreras(), 300);
        },
        error: () => this.mostrarError('Error al actualizar carrera')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      const carreraParaEnviar = {
        nombreCarrera: nombreIngresado,
        idFacultad: Number(idFacultadSeleccionada)
      };

      this.adminService.agregarCarrera(carreraParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Carrera agregada exitosamente');
          this.nuevaCarrera = { nombreCarrera: '', idFacultad: null };
          setTimeout(() => this.cargarCarreras(), 300);
        },
        error: () => this.mostrarError('Error al agregar carrera')
      });
    }
  }

  eliminarCarrera(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta carrera?').then(acepto => {
      if (!acepto) return;

      this.adminService.eliminarCarrera(id).subscribe({
        next: () => {
          this.mostrarExito('Carrera eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Limpia el form si borra la que edita
          setTimeout(() => this.cargarCarreras(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar esta carrera porque ya está siendo utilizada en otros registros del sistema.',
            'Acción Denegada',
            'advertencia'
          );
        }
      });
    });
  }


  obtenerNombreFacultad(car: any): string {
    if (car.facultad && car.facultad.nombreFacultad) {
      return car.facultad.nombreFacultad;
    }
    const idBuscado = car.facultad ? car.facultad.idFacultad : car.idFacultad;
    if (!idBuscado) return 'Sin facultad';
    const facultad = this.facultadesDisponibles.find(f => Number(f.idFacultad) === Number(idBuscado));
    return facultad ? facultad.nombreFacultad! : 'Sin facultad';
  }

  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje; this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 3000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje; this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 3000);
  }
}
