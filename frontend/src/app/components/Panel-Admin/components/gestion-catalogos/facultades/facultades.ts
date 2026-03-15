import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo { idFacultad?: number; nombreFacultad?: string; nombre?: string; }

@Component({
  selector: 'app-facultades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facultades.html',
  styleUrls: ['./facultades.css']
})
export class FacultadesComponent implements OnInit {
  facultades: Catalogo[] = [];
  nuevaFacultad: Catalogo = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarFacultades();
  }

  cargarFacultades(): void {
    this.adminService.getFacultadesCatalogo().subscribe({
      next: (data) => {
        this.facultades = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar facultades')
    });
  }

  // === NUEVO MÉTODO PARA PREPARAR LA EDICIÓN ===
  editarFacultad(fac: Catalogo): void {
    this.idEditando = fac.idFacultad!;
    this.nuevaFacultad.nombre = fac.nombreFacultad!;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suavemente
  }

  // === NUEVO MÉTODO PARA CANCELAR ===
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaFacultad.nombre = '';
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarFacultad(): void {
    const nombreIngresado = this.nuevaFacultad.nombre?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre de la facultad es obligatorio');
      return;
    }

    // Validación de duplicados (excluyendo la facultad que estamos editando)
    const existeFacultad = this.facultades.some(
      f => f.nombreFacultad?.toLowerCase() === nombreIngresado.toLowerCase() && f.idFacultad !== this.idEditando
    );

    if (existeFacultad) {
      this.confirmService.abrir(
        `No puedes guardar la facultad con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const facultadActualizada = {
        idFacultad: this.idEditando,
        nombreFacultad: nombreIngresado
      };

      this.adminService.actualizarFacultad(facultadActualizada).subscribe({
        next: () => {
          this.mostrarExito('Facultad actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarFacultades(), 300);
        },
        error: () => this.mostrarError('Error al actualizar facultad')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      const facultadParaEnviar = { nombreFacultad: nombreIngresado };
      this.adminService.agregarFacultad(facultadParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Facultad agregada exitosamente');
          this.nuevaFacultad.nombre = '';
          setTimeout(() => this.cargarFacultades(), 300);
        },
        error: () => this.mostrarError('Error al agregar facultad')
      });
    }
  }

  eliminarFacultad(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta facultad?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarFacultad(id).subscribe({
        next: () => {
          this.mostrarExito('Facultad eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Si borra la que edita, limpia
          setTimeout(() => this.cargarFacultades(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar esta Facultad porque ya está siendo utilizada en otros registros del sistema.',
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
