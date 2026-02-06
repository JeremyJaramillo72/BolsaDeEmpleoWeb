import {Component, NgIterable, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.css']
})
export class AdminUsuariosComponent implements OnInit {
  users: any[] = [];
  usuarios: (NgIterable<unknown> & NgIterable<any>) | undefined | null;

  ngOnInit(): void {
    // Simulando 
    this.usuarios = [
      { id: 1, nombre: 'Juan Pérez', correo: 'juan@mail.com', rol: 'POSTULANTE', activo: true },
      { id: 2, nombre: 'Empresa ABC', correo: 'abc@corp.com', rol: 'EMPRESA', activo: false }
    ];
  }

  toggleEstado(user: any) {
    user.activo = !user.activo;
    console.log('Cambiando estado de usuario:', user.id, 'a', user.activo);
    const accion = user.activo ? 'activado' : 'desactivado';
    alert(`Usuario ${user.nombre} ha sido ${accion}`);

  }


}
