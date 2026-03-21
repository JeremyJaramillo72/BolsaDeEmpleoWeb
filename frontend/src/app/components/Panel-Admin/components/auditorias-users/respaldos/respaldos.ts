import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-respaldos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respaldos.html',
  styleUrls: ['./respaldos.css']
})
export class RespaldosComponent implements OnInit {

  // ✅ Inyección moderna de Angular (o puedes usar el constructor clásico)
  private adminService = inject(AdminService);

  // Variables para la vista principal
  textoBusqueda: string = '';
  resumenBackups: any[] = [];

  // Variables para el Modal de Detalles
  modalAbierto: boolean = false;
  usuarioSeleccionado: string = '';
  detallesHistorial: any[] = [];
  cargandoDetalles: boolean = false; // Para mostrar el spinner en el HTML

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    // Llamada real al backend
    this.adminService.obtenerResumenRespaldos().subscribe({
      next: (data) => {
        this.resumenBackups = data;
      },
      error: (err) => {
        console.error('Pailas, error al cargar el resumen:', err);
      }
    });
  }

  abrirDetalle(usuario: any): void {
    // Validamos que el usuario tenga un ID, si no, pailas.

    console.log('Data que llega del click:', usuario); // 👈 Revisa esto en la consola

    // Usa esta lógica para no fallar:
    const id = usuario.id_usuario || usuario.idUsuario;

    if (!id) {
      console.error('ID no encontrado en el objeto:', usuario);
      return;
    }
    if (!usuario.id_usuario) {
      console.error('El usuario no tiene un ID válido');
      return;
    }

    this.usuarioSeleccionado = usuario.correo_ejecutor;
    this.modalAbierto = true;
    this.cargandoDetalles = true;
    this.detallesHistorial = [];

    // ✅ Llamada limpia al servicio pasando solo el número
    this.adminService.obtenerDetalleRespaldos(usuario.id_usuario).subscribe({
      next: (data) => {
        this.detallesHistorial = data;
        this.cargandoDetalles = false;
      },
      error: (err) => {
        console.error('Error trayendo el detalle del usuario:', err);
        this.cargandoDetalles = false;
        // Opcional: podrías poner un mensaje de error en la UI aquí
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.detallesHistorial = [];
  }

  // Utilidad para formatear bytes a MB
  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
