import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ConfirmService } from '../../../../../services/confirm.service';

interface Rol { idRol?: number; nombreRol: string; }

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.css']
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  nuevoRol: Rol = { nombreRol: '' };
  mensajeExito = '';
  mensajeError = '';

  // === NUEVA VARIABLE PARA EDICIÓN ===
  idEditando: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef, private confirmService: ConfirmService) {}

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.adminService.getRolesCatalogo().subscribe({
      next: (data) => {
        this.roles = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar roles')
    });
  }

  // === NUEVO MÉTODO PARA PREPARAR LA EDICIÓN ===
  editarRol(rol: Rol): void {
    this.idEditando = rol.idRol!;
    this.nuevoRol.nombreRol = rol.nombreRol;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube suavemente
  }

  // === NUEVO MÉTODO PARA CANCELAR ===
  cancelarEdicion(): void {
    this.idEditando = null;
    this.nuevoRol.nombreRol = '';
  }

  // === MÉTODO ACTUALIZADO (Agregar y Actualizar) ===
  guardarRol(): void {
    const nombreIngresado = this.nuevoRol.nombreRol?.trim() || '';

    if (!nombreIngresado) {
      this.mostrarError('El nombre del rol es obligatorio');
      return;
    }

    // Validación de duplicados (excluyendo el rol que estamos editando)
    const existeRol = this.roles.some(
      r => r.nombreRol?.toLowerCase() === nombreIngresado.toLowerCase() && r.idRol !== this.idEditando
    );

    if (existeRol) {
      this.confirmService.abrir(
        `No puedes guardar el rol con el nombre "${nombreIngresado}". Ya existe.`,
        'Advertencia',
        'advertencia'
      );
      return;
    }

    if (this.idEditando) {
      // ==== LÓGICA DE ACTUALIZAR ====
      const rolActualizado = {
        idRol: this.idEditando,
        nombreRol: nombreIngresado
      };

      this.adminService.actualizarRol(rolActualizado).subscribe({
        next: () => {
          this.mostrarExito('Rol actualizado exitosamente');
          this.cancelarEdicion();
          setTimeout(() => this.cargarRoles(), 300);
        },
        error: () => this.mostrarError('Error al actualizar rol')
      });

    } else {
      // ==== LÓGICA DE AGREGAR ====
      this.adminService.agregarRol({ nombreRol: nombreIngresado }).subscribe({
        next: () => {
          this.mostrarExito('Rol agregado exitosamente');
          this.nuevoRol.nombreRol = '';
          setTimeout(() => this.cargarRoles(), 300);
        },
        error: () => this.mostrarError('Error al agregar rol')
      });
    }
  }

  eliminarRol(id: number): void {
    this.confirmService.abrir('¿Está seguro de eliminar este rol?').then(acepto => {
      if (!acepto) return;
      this.adminService.eliminarRol(id).subscribe({
        next: () => {
          this.mostrarExito('Rol eliminado exitosamente');
          if (this.idEditando === id) this.cancelarEdicion(); // Limpia si borra el que está editando
          setTimeout(() => this.cargarRoles(), 300);
        },
        error: (err) => {
          this.confirmService.abrir(
            'No se puede eliminar este Rol porque ya está siendo utilizado en otros registros del sistema.',
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
