import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Variables vinculadas al formulario [(ngModel)]
  correo: string = '';
  contrasena: string = '';

  // Manejo de estados de la UI
  errorMsg: string = '';
  verPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  /**
   * Envía las credenciales al backend de Spring Boot
   */
  onLogin() {
    this.errorMsg = '';
    const loginData = { correo: this.correo, contrasena: this.contrasena };

    this.http.post('http://localhost:8080/api/auth/login', loginData)
      .subscribe({
        next: (res: any) => {
          // DEBUG: Ver qué llega del backend
          console.log('Respuesta completa del backend:', res);
          console.log('res.rol:', res.rol);

          // 1. GUARDAR DATOS INDIVIDUALES
          localStorage.setItem('idUsuario', res.idUsuario);
          localStorage.setItem('nombre', res.nombre);

          // Extraer el nombre del rol correctamente
          let rolNombre = '';
          if (res.rol && typeof res.rol === 'object') {
            // Si viene como objeto: { idRol: 3, nombreRol: "Postulante" }
            rolNombre = res.rol.nombreRol || res.rol.nombre || '';
          } else {
            // Si viene como string directo
            rolNombre = res.rol || '';
          }

          // Guardar el rol en mayúsculas para consistencia
          localStorage.setItem('rol', rolNombre.trim().toUpperCase());

          // DEBUG: Ver qué se guardó
          console.log('Guardado en localStorage:');
          console.log('  idUsuario:', localStorage.getItem('idUsuario'));
          console.log('  nombre:', localStorage.getItem('nombre'));
          console.log('  rol:', localStorage.getItem('rol'));

          // 2. NAVEGACIÓN
          this.router.navigate(['/menu-principal']).then((success) => {
            if (success) {
              console.log('¡Navegación exitosa al menú!');
            } else {
              console.error('La navegación falló. Revisa app.routes.ts');
            }
          });
        },
        error: (err) => {
          this.errorMsg = err.error?.error || 'Error de conexión con el servidor.';
        }
      });
  }
}
