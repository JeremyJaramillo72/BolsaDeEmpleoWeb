import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Provincia { idProvincia?: number; nombreProvincia?: string; nombre?: string; }

@Component({
  selector: 'app-provincias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './provincias.html',
  styleUrls: ['./provincias.css'] // Asegúrate de tener o crear este CSS
})
export class ProvinciasComponent implements OnInit {
  provincias: Provincia[] = [];
  nuevaProvincia: Provincia = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarProvincias();
  }

  cargarProvincias(): void {
    this.adminService.getProvinciasCatalogo().subscribe({
      next: (data) => {
        this.provincias = [...data];
        this.cdr.detectChanges();
      },
      error: () => this.mostrarError('Error al cargar provincias')
    });
  }

  editarProvincia(prov: Provincia): void {
    this.idEditando = prov.idProvincia!;
    this.nuevaProvincia.nombre = prov.nombreProvincia!;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaProvincia.nombre = '';
  }

  guardarProvincia(): void {
    const nombreIngresado = this.nuevaProvincia.nombre?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre de la provincia es obligatorio');
      return;
    }

    const existeProvincia = this.provincias.some(
      p => p.nombreProvincia?.toLowerCase() === nombreIngresado.toLowerCase() && p.idProvincia !== this.idEditando
    );

    if (existeProvincia) {
      this.confirmService.abrir(
        `No puedes guardar la provincia con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      const provinciaActualizada = { idProvincia: this.idEditando, nombreProvincia: nombreIngresado };
      this.adminService.actualizarProvincia(provinciaActualizada).subscribe({
        next: () => {
          this.mostrarExito('Provincia actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarProvincias(), 300);
        },
        error: () => this.mostrarError('Error al actualizar provincia')
      });
    } else {
      this.adminService.agregarProvincia({ nombreProvincia: nombreIngresado }).subscribe({
        next: () => {
          this.mostrarExito('Provincia agregada exitosamente');
          this.nuevaProvincia.nombre = '';
          setTimeout(() => this.cargarProvincias(), 300);
        },
        error: () => this.mostrarError('Error al agregar provincia')
      });
    }
  }

  eliminarProvincia(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta provincia?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarProvincia(id).subscribe({
        next: () => {
          this.mostrarExito('Provincia eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion();
          setTimeout(() => this.cargarProvincias(), 300);
        },
        error: () => {
          this.confirmService.abrir(
            'No se puede eliminar esta provincia porque ya tiene ciudades o registros asociados.',
            'Acción Denegada',
            'advertencia'
          );
        }
      });
    });
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
