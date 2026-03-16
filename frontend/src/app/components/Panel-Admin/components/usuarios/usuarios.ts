import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from './Service/UsuariosService'; // Asegúrate de que el nombre del archivo coincida
import { ConfirmService } from '../../../../services/confirm.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  terminoBusqueda: string = '';

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private usuariosService: UsuariosService, // <-- CORREGIDO: Unificado a usuariosService
    private cdr: ChangeDetectorRef,
    private confirmService: ConfirmService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    // <-- CORREGIDO: Usando this.usuariosService y el método getUsuariosTabla()
    this.usuariosService.getUsuariosTabla().subscribe({
      next: (data) => {
        this.usuarios = [...data];
        this.usuariosFiltrados = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarError('Error al cargar la lista de usuarios')
    });
  }

  filtrarUsuarios(): void {
    const termino = this.terminoBusqueda.toLowerCase().trim();
    if (!termino) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(u =>
      (u.nombre && u.nombre.toLowerCase().includes(termino)) ||
      (u.correo && u.correo.toLowerCase().includes(termino)) ||
      (u.nombre_rol && u.nombre_rol.toLowerCase().includes(termino))
    );
  }

  // === MÉTODO PARA LA INICIAL DEL AVATAR ===
  obtenerInicial(nombre: string): string {
    if (!nombre) return 'U';
    return nombre.charAt(0).toUpperCase();
  }

  bloquearUsuario(usr: any): void {
    // Evaluamos el valor real de la base de datos (Ahora con 'A' y 'P' mayúsculas)
    const nuevoEstado = usr.estado_validacion === 'Aprobado' ? 'Pendiente' : 'Aprobado';

    // Texto para el modal basado en lo que el usuario ve
    const accionTexto = usr.estado_validacion === 'Aprobado' ? 'inactivar' : 'activar';

    this.confirmService.abrir(`¿Está seguro de ${accionTexto} a este usuario?`, 'Confirmar Acción').then(acepto => {
      if (acepto) {
        this.usuariosService.cambiarEstadoUsuario(usr.id_usuario, nuevoEstado).subscribe({
          next: () => {
            // Mostramos el mensaje con la traducción visual para que no se confunda
            const estadoVisual = nuevoEstado === 'Aprobado' ? 'ACTIVO' : 'INACTIVO';
            this.mostrarExito(`Usuario actualizado a ${estadoVisual} exitosamente.`);

            this.cargarUsuarios(); // Recargamos la tabla para ver el cambio
          },
          error: () => this.mostrarError('Error al cambiar el estado del usuario')
        });
      }
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
