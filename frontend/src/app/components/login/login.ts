import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos lo necesario para que el HTML reconozca ngModel, routerLink y directivas como *ngIf
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

  /**
   * Cambia la visibilidad de la contraseña en el campo de texto
   */
  togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  /**
   * Envía las credenciales al backend de Spring Boot
   */
  onLogin() {
    // Limpiamos mensajes de error previos
    this.errorMsg = '';

    const loginData = {
      correo: this.correo,
      contrasena: this.contrasena
    };

    // Petición al endpoint que configuramos en el AuthController
    this.http.post('http://localhost:8080/api/auth/login', loginData)
      .subscribe({
        next: (res: any) => {
          console.log('Login exitoso:', res);

          // Guardamos la sesión en el localStorage para persistencia
          localStorage.setItem('usuario', JSON.stringify(res));

          alert(res.mensaje || '¡Bienvenido de nuevo!');

          // Redirigir según el rol devuelto por la base de datos de la UTEQ
          if (res.rol === 'EMPRESA') {
            this.router.navigate(['/registro-empresa']); // Cambia esto por tu dashboard de empresa luego
          } else {
            this.router.navigate(['/registro-candidato']); // Cambia esto por el perfil del graduado luego
          }
        },
        error: (err) => {
          console.error('Error en el login:', err);
          // Capturamos el mensaje de error que configuramos en el ResponseEntity del backend
          this.errorMsg = err.error?.error || 'Error al iniciar sesión. Inténtelo más tarde.';
        }
      });
  }
}
