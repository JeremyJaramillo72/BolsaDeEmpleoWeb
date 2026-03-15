import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Catalogo {
  id?: number; nombre: string; idCategoria?: number; nombreCategoria?: string;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class CategoriasComponent implements OnInit {
  categorias: Catalogo[] = [];
  nuevaCategoria: Catalogo = { nombre: '' };
  mensajeExito = '';
  mensajeError = '';

  // NUEVA VARIABLE PARA CONTROLAR LA EDICIÓN
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.adminService.getCategoriasCatalogo().subscribe({
      next: (data) => {
        this.categorias = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar categorías')
    });
  }

  // NUEVO MÉTODO PARA PREPARAR LA EDICIÓN
  editarCategoria(cat: Catalogo): void {
    this.idEditando = cat.idCategoria!;
    this.nuevaCategoria.nombre = cat.nombreCategoria!;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla suavemente
  }

  // NUEVO MÉTODO PARA CANCELAR
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevaCategoria.nombre = '';
  }

  // MÉTODO ACTUALIZADO (Sirve para Agregar y Actualizar)
  guardarCategoria(): void {
    const nombreIngresado = this.nuevaCategoria.nombre.trim();

    if (!nombreIngresado) {
      this.mostrarError('El nombre de la categoría es obligatorio');
      return;
    }

    // Validación de duplicados (excluye el que estamos editando actualmente para que permita guardar si no cambiamos el nombre)
    const existeCategoria = this.categorias.some(
      c => c.nombreCategoria?.toLowerCase() === nombreIngresado.toLowerCase() && c.idCategoria !== this.idEditando
    );

    if (existeCategoria) {
      this.confirmService.abrir(
        `No puedes guardar la categoría con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const categoriaActualizada = { idCategoria: this.idEditando, nombreCategoria: nombreIngresado };

      // Asegúrate de que este método exista en tu AdminService
      this.adminService.actualizarCategoria(categoriaActualizada).subscribe({
        next: () => {
          this.mostrarExito('Categoría actualizada exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarCategorias(), 300);
        },
        error: () => this.mostrarError('Error al actualizar categoría')
      });

    } else {
      // ==== LÓGICA DE AGREGAR (La que ya tenías) ====
      const categoriaParaEnviar = { nombreCategoria: nombreIngresado };
      this.adminService.agregarCategoria(categoriaParaEnviar).subscribe({
        next: () => {
          this.mostrarExito('Categoría agregada exitosamente');
          this.nuevaCategoria.nombre = '';
          setTimeout(() => this.cargarCategorias(), 300);
        },
        error: () => this.mostrarError('Error al agregar categoría')
      });
    }
  }

  eliminarCategoria(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar esta categoría?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarCategoria(id).subscribe({
        next: () => {
          this.mostrarExito('Categoría eliminada exitosamente');
          this.categorias = this.categorias.filter(c => c.idCategoria !== id);
          if (this.idEditando === id) this.cancelarEdicion(); // Por si borra el que estaba editando
          setTimeout(() => this.cargarCategorias(), 300);
        },
        error: () => {
          this.confirmService.abrir(
            'No se puede eliminar esta Categoria porque ya está siendo utilizada en otros registros del sistema.',
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
