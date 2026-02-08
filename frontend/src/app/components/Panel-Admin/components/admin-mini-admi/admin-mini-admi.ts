import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MiniAdmin {
  id: number;
  usuario: string;
  contrasena: string;
  rolBD: string;
  fechaCreacion: Date;
  permisosUI: string[];
  activo: boolean;
}

interface SeccionUI {
  id: string;
  nombre: string;
  seleccionada: boolean;
}

@Component({
  selector: 'app-admin-mini-admi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mini-admi.html',
  styleUrls: ['./admin-mini-admi.css']
})
export class AdminMiniAdmiComponent implements OnInit {

  vistaActual: 'LISTA' | 'CREAR' = 'LISTA';
  listaAdmins: MiniAdmin[] = [];

  nuevoAdmin: Partial<MiniAdmin> = { 

    usuario: '',
    contrasena: '',
    rolBD: '',
    permisosUI: []
  };

  rolesDisponibles = [
    { valor: 'grupo_supervisor', etiqueta: 'Supervisor (Operativo)' },
    { valor: 'grupo_gerente', etiqueta: 'Gerente (Reportes)' },
    { valor: 'grupo_soporte', etiqueta: 'Soporte (Lectura)' }
  ];

  seccionesDisponibles: SeccionUI[] = [
    { id: 'gestion_usuarios', nombre: 'Gestión de Usuarios', seleccionada: false },
    { id: 'validacion_ofertas', nombre: 'Validación de Ofertas', seleccionada: false },
    { id: 'gestion_catalogos', nombre: 'Gestión de Catálogos', seleccionada: false },
    { id: 'reportes', nombre: 'Reportes y Estadísticas', seleccionada: false }
  ];

  ngOnInit(): void {
    // Datos de ejemplo
    this.listaAdmins = [
      {
        id: 1,
        usuario: 'admin_principal',
        contrasena: '*****',
        rolBD: 'grupo_gerente',
        fechaCreacion: new Date(),
        permisosUI: ['Gestión de Usuarios', 'Reportes'],
        activo: true
      }
    ];
  }

  iniciarCreacion() {
    this.vistaActual = 'CREAR';
    this.limpiarFormulario();
  }

  cancelarCreacion() {
    this.vistaActual = 'LISTA';
    this.limpiarFormulario();
  }

  guardarAdmin() {
    if (!this.nuevoAdmin.usuario || !this.nuevoAdmin.rolBD) {
      alert('Por favor completa usuario y rol.');
      return;
    }

    const permisos = this.seccionesDisponibles
      .filter(s => s.seleccionada)
      .map(s => s.nombre);

    const nuevo: MiniAdmin = {
      id: Date.now(), // ID temporal único
      usuario: this.nuevoAdmin.usuario!,
      contrasena: this.nuevoAdmin.contrasena || '123456',
      rolBD: this.nuevoAdmin.rolBD!,
      fechaCreacion: new Date(),
      permisosUI: permisos,
      activo: true
    };

    this.listaAdmins.push(nuevo);
    this.vistaActual = 'LISTA';
  }

  toggleEstado(admin: MiniAdmin) {
    admin.activo = !admin.activo;
  }

  private limpiarFormulario() {
    this.nuevoAdmin = { usuario: '', contrasena: '', rolBD: '' };
    this.seccionesDisponibles.forEach(s => s.seleccionada = false);
  }
}
