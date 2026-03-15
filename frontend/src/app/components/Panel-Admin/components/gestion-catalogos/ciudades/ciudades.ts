import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Provincia { idProvincia?: number; nombreProvincia?: string; }

@Component({
  selector: 'app-ciudades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ciudades.html',
  styleUrls: ['./ciudades.css'] // Asegúrate de tener o crear este CSS
})
export class CiudadesComponent implements OnInit {
  ciudades: any[] = [];
  ciudadesFiltradas: any[] = [];
  provinciasDisponibles: Provincia[] = [];
  nuevaCiudad: any = { nombreCiudad: '', idProvincia: null };
  mensajeExito = '';
  mensajeError = '';
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarProvincias();
    this.cargarCiudades();
  }

  cargarCiudades(): void {
    this.adminService.getCiudadesCatalogo().subscribe({
      next: (data) => {
        this.ciudades = [...data];
        this.ciudadesFiltradas = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.mostrarError('Error al cargar ciudades')
    });
  }

  cargarProvincias(): void {
    this.adminService.getProvinciasCatalogo().subscribe({
      next: (data) => {
        this.provinciasDisponibles = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.mostrarError('Error al cargar provincias')
    });
  }

  onProvinciaChange(idProvincia: number): void {
    if (idProvincia) {
      this.adminService.getCiudadesPorProvincia(idProvincia).subscribe({
        next: (data) => {
          this.ciudadesFiltradas = [...data];
          this.cdr.detectChanges();
        },
        error: () => {
          this.mostrarError('Error al cargar las ciudades de esta provincia');
          this.ciudadesFiltradas = [];
        }
      });
    } else {
      this.ciudadesFiltradas = [...this.ciudades];
    }
  }

  editarCiudad(ciu: any): void {
    this.idEditando = ciu.idCiudad;
    const idProv = ciu.provincia ? ciu.provincia.idProvincia : ciu.idProvincia;

    this.nuevaCiudad = {
      nombreCiudad: ciu.nombreCiudad,
      idProvincia: idProv ? Number(idProv) : null
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaCiudad = { nombreCiudad: '', idProvincia: null };
  }

  guardarCiudad(): void {
    const nombreIngresado = this.nuevaCiudad.nombreCiudad?.trim();
    const idProvinciaSeleccionada = this.nuevaCiudad.idProvincia;

    if (!nombreIngresado || !idProvinciaSeleccionada) {
      this.mostrarError('Complete todos los campos de la ciudad');
      return;
    }

    const existeCiudad = this.ciudades.some(
      c => c.nombreCiudad?.toLowerCase() === nombreIngresado.toLowerCase() && c.idCiudad !== this.idEditando
    );

    if (existeCiudad) {
      this.confirmService.abrir(
        `No puedes guardar la ciudad con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      const ciudadActualizada = {
        idCiudad: this.idEditando,
        nombreCiudad: nombreIngresado,
        idProvincia: Number(idProvinciaSeleccionada)
      };

      this.adminService.actualizarCiudad(ciudadActualizada).subscribe({
        next: () => {
          this.mostrarExito('Ciudad actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarCiudades(), 300);
        },
        error: () => this.mostrarError('Error al actualizar ciudad')
      });
    } else {
      const ciudadParaEnviar = {
        nombreCiudad: nombreIngresado,
        idProvincia: Number(idProvinciaSeleccionada)
      };

      this.adminService.agregarCiudad(ciudadParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Ciudad agregada exitosamente');
          this.nuevaCiudad = { nombreCiudad: '', idProvincia: null };
          setTimeout(() => this.cargarCiudades(), 300);
        },
        error: () => this.mostrarError('Error al agregar ciudad')
      });
    }
  }

  eliminarCiudad(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta ciudad?').then(acepto => {
      if (!acepto) return;

      this.adminService.eliminarCiudad(id).subscribe({
        next: () => {
          this.mostrarExito('Ciudad eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion();
          setTimeout(() => this.cargarCiudades(), 300);
        },
        error: () => {
          this.confirmService.abrir(
            'No se puede eliminar esta ciudad porque ya está en uso.',
            'Acción Denegada',
            'advertencia'
          );
        }
      });
    });
  }

  obtenerNombreProvincia(ciu: any): string {
    if (ciu.provincia && ciu.provincia.nombreProvincia) return ciu.provincia.nombreProvincia;
    const idBuscado = ciu.provincia ? ciu.provincia.idProvincia : ciu.idProvincia;
    if (!idBuscado) return 'Sin provincia';

    const provincia = this.provinciasDisponibles.find(p => Number(p.idProvincia) === Number(idBuscado));
    return provincia ? provincia.nombreProvincia! : 'Sin provincia';
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
