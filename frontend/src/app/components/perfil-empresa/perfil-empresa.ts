import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; //
import { UsuarioEmpresaService, UsuarioEmpresaDTO } from '../../services/usuario-empresa.service';

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-empresa.html',
  styleUrls: ['./perfil-empresa.css']
})
export class PerfilEmpresaComponent implements OnInit {

  perfil: UsuarioEmpresaDTO = {
    idUsuario: 0,
    nombre: '',
    descripcion: '',
    ruc: '',
    sitioWeb: ''
  };

  constructor(
    private empresaService: UsuarioEmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosDelUsuarioLogueado();
  }

  cargarDatosDelUsuarioLogueado() {

    const idGuardado = localStorage.getItem('idUsuario');

    if (idGuardado) {
      const idUsuario = Number(idGuardado);

      console.log('Cargando perfil para el usuario ID:', idUsuario);

      this.empresaService.obtenerPerfilPorUsuario(idUsuario).subscribe({
        next: (data) => {
          this.perfil = data;
          if (!this.perfil.idUsuario) {
            this.perfil.idUsuario = idUsuario;
          }
        },
        error: (e) => {
          console.error('Error al cargar datos:', e);
        }
      });

    } else {
      alert('No se encontró sesión activa.');
      this.router.navigate(['/login']);
    }
  }

  guardarCambios() {

    if (this.perfil.idEmpresa) {
      this.empresaService.actualizarPerfil(this.perfil.idEmpresa, this.perfil).subscribe({
        next: () => alert('¡Perfil actualizado con éxito!'),
        error: (e) => alert('Error al actualizar: ' + e.message)
      });
    } else {
      alert('No se puede actualizar: El perfil no tiene ID de empresa asignado.');
    }
  }
}
