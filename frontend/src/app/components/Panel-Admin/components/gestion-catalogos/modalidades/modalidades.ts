import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo { idModalidad?: number; nombreModalidad?: string; nombre?: string; }

@Component({
  selector: 'app-modalidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modalidades.html',
  styleUrls: ['./modalidades.css']
})
export class ModalidadesComponent implements OnInit {
  modalidades: Catalogo[] = [];
  nuevaModalidad: Catalogo = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarModalidades();
  }

  cargarModalidades(): void {
    this.adminService.getModalidadesCatalogo().subscribe({
      next: (data) => {
        this.modalidades = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar modalidades')
    });
  }

  // === NUEVO MÉTODO PARA PREPARAR LA EDICIÓN ===
  editarModalidad(mod: Catalogo): void {
    this.idEditando = mod.idModalidad!;
    this.nuevaModalidad.nombre = mod.nombreModalidad!;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suavemente
  }

  // === NUEVO MÉTODO PARA CANCELAR ===
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaModalidad.nombre = '';
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarModalidad(): void {
    const nombreIngresado = this.nuevaModalidad.nombre?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre de la modalidad es obligatorio');
      return;
    }

    // Validación de duplicados (excluyendo la modalidad que estamos editando)
    const existeModalidad = this.modalidades.some(
      m => m.nombreModalidad?.toLowerCase() === nombreIngresado.toLowerCase() && m.idModalidad !== this.idEditando
    );

    if (existeModalidad) {
      this.confirmService.abrir(
        `No puedes guardar la modalidad con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const modalidadActualizada = {
        idModalidad: this.idEditando,
        nombreModalidad: nombreIngresado
      };

      this.adminService.actualizarModalidad(modalidadActualizada).subscribe({
        next: () => {
          this.mostrarExito('Modalidad actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarModalidades(), 300);
        },
        error: () => this.mostrarError('Error al actualizar modalidad')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      const modalidadParaEnviar = { nombreModalidad: nombreIngresado };
      this.adminService.agregarModalidad(modalidadParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Modalidad agregada exitosamente');
          this.nuevaModalidad.nombre = '';
          setTimeout(() => this.cargarModalidades(), 300);
        },
        error: () => this.mostrarError('Error al agregar modalidad')
      });
    }
  }

  eliminarModalidad(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta modalidad?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarModalidad(id).subscribe({
        next: () => {
          this.mostrarExito('Modalidad eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Limpia si borra la que está editando
          setTimeout(() => this.cargarModalidades(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar esta Modalidad porque ya está siendo utilizada en otros registros del sistema.',
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
