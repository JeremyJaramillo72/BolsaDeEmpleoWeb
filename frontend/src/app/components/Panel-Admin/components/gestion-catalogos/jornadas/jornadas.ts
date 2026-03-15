import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo { idJornada?: number; nombreJornada?: string; nombre?: string; }

@Component({
  selector: 'app-jornadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jornadas.html',
  styleUrls: ['./jornadas.css']
})
export class JornadasComponent implements OnInit {
  jornadas: Catalogo[] = [];
  nuevaJornada: Catalogo = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarJornadas();
  }

  cargarJornadas(): void {
    this.adminService.getJornadasCatalogo().subscribe({
      next: (data) => {
        this.jornadas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar jornadas')
    });
  }

  // === NUEVO MÉTODO PARA PREPARAR LA EDICIÓN ===
  editarJornada(jor: Catalogo): void {
    this.idEditando = jor.idJornada!;
    this.nuevaJornada.nombre = jor.nombreJornada!;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suavemente
  }

  // === NUEVO MÉTODO PARA CANCELAR ===
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaJornada.nombre = '';
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarJornada(): void {
    const nombreIngresado = this.nuevaJornada.nombre?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre de la jornada es obligatorio');
      return;
    }

    // Validación de duplicados (excluyendo la jornada que estamos editando)
    const existeJornada = this.jornadas.some(
      j => j.nombreJornada?.toLowerCase() === nombreIngresado.toLowerCase() && j.idJornada !== this.idEditando
    );

    if (existeJornada) {
      this.confirmService.abrir(
        `No puedes guardar la jornada con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const jornadaActualizada = {
        idJornada: this.idEditando,
        nombreJornada: nombreIngresado
      };

      this.adminService.actualizarJornada(jornadaActualizada).subscribe({
        next: () => {
          this.mostrarExito('Jornada actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarJornadas(), 300);
        },
        error: () => this.mostrarError('Error al actualizar jornada')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      const jornadaParaEnviar = { nombreJornada: nombreIngresado };
      this.adminService.agregarJornada(jornadaParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Jornada agregada exitosamente');
          this.nuevaJornada.nombre = '';
          setTimeout(() => this.cargarJornadas(), 300);
        },
        error: () => this.mostrarError('Error al agregar jornada')
      });
    }
  }

  eliminarJornada(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta jornada?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarJornada(id).subscribe({
        next: () => {
          this.mostrarExito('Jornada eliminada exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Limpia si borra la que está editando
          setTimeout(() => this.cargarJornadas(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar esta Jornada porque ya está siendo utilizada en otros registros del sistema.',
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
