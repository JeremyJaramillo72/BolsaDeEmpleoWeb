import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo { idIdioma?: number; nombreIdioma?: string; nombre?: string; }

@Component({
  selector: 'app-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idiomas.html',
  styleUrls: ['./idiomas.css']
})
export class IdiomasComponent implements OnInit {
  idiomas: Catalogo[] = [];
  nuevoIdioma: Catalogo = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarIdiomas();
  }

  cargarIdiomas(): void {
    this.adminService.getIdiomasCatalogo().subscribe({
      next: (data) => {
        this.idiomas = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar idiomas')
    });
  }

  // === NUEVO MÉTODO PARA PREPARAR LA EDICIÓN ===
  editarIdioma(idm: Catalogo): void {
    this.idEditando = idm.idIdioma!;
    this.nuevoIdioma.nombre = idm.nombreIdioma!;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suavemente
  }

  // === NUEVO MÉTODO PARA CANCELAR ===
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevoIdioma.nombre = '';
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarIdioma(): void {
    const nombreIngresado = this.nuevoIdioma.nombre?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre del idioma es obligatorio');
      return;
    }

    // Validación de duplicados (excluyendo el idioma que estamos editando)
    const existeIdioma = this.idiomas.some(
      i => i.nombreIdioma?.toLowerCase() === nombreIngresado.toLowerCase() && i.idIdioma !== this.idEditando
    );

    if (existeIdioma) {
      this.confirmService.abrir(
        `No puedes guardar el idioma con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const idiomaActualizado = {
        idIdioma: this.idEditando,
        nombreIdioma: nombreIngresado
      };

      this.adminService.actualizarIdioma(idiomaActualizado).subscribe({
        next: () => {
          this.mostrarExito('Idioma actualizado exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarIdiomas(), 300);
        },
        error: () => this.mostrarError('Error al actualizar idioma')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      const idiomaParaEnviar = { nombreIdioma: nombreIngresado };
      this.adminService.agregarIdioma(idiomaParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Idioma agregado exitosamente');
          this.nuevoIdioma.nombre = '';
          setTimeout(() => this.cargarIdiomas(), 300);
        },
        error: () => this.mostrarError('Error al agregar idioma')
      });
    }
  }

  eliminarIdioma(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar este idioma?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarIdioma(id).subscribe({
        next: () => {
          this.mostrarExito('Idioma eliminado exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Limpia si borra el que edita
          setTimeout(() => this.cargarIdiomas(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar este idioma porque ya está siendo utilizado en otros registros del sistema.',
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
