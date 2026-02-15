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
  // variables vinculadas al formulario [(ngmodel)]
  correo: string = '';
  contrasena: string = '';

  // manejo de estados de la ui
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
   * envía las credenciales al backend de spring boot
   */
  onLogin() {
    this.errorMsg = '';
    const loginData = { correo: this.correo, contrasena: this.contrasena };

    this.http.post('http://localhost:8080/api/auth/login', loginData)
      .subscribe({
        next: (res: any) => {
          console.log('respuesta completa del backend:', res);

          localStorage.setItem('idUsuario', res.idUsuario);
          localStorage.setItem('idRol', res.rol.idRol || res.idRol);
          localStorage.setItem('nombre', res.nombre);
          localStorage.setItem('permisosUi', res.permisosUi || '');

          if (res.empresa && res.empresa.idEmpresa) {
            localStorage.setItem('idEmpresa', res.empresa.idEmpresa.toString());
            console.log('✅ idempresa guardado (desde objeto):', res.empresa.idEmpresa);
          } else if (res.idEmpresa) {
            localStorage.setItem('idEmpresa', res.idEmpresa.toString());
            console.log('✅ idempresa guardado (desde raíz):', res.idEmpresa);
          }

          let rolNombre = '';
          if (res.rol && typeof res.rol === 'object') {
            rolNombre = res.rol.nombreRol || res.rol.nombre || '';
          } else {
            rolNombre = res.rol || '';
          }

          localStorage.setItem('rol', rolNombre.trim().toUpperCase());

          console.log('estado final del localstorage:');
          console.log('  idusuario:', localStorage.getItem('idUsuario'));
          console.log('  idempresa:', localStorage.getItem('idEmpresa'));
          console.log('  rol:', localStorage.getItem('rol'));

          this.router.navigate(['/menu-principal']).then((success) => {
            if (success) {
              console.log('¡navegación exitosa al menú!');
            } else {
              console.error('la navegación falló.');
            }
          });
        },
        error: (err) => {
          // asignamos el error a la variable por si lo usas en el html
          this.errorMsg = err.error?.error || 'error de conexión con el servidor.';

          // 👇 forzamos una ventana emergente para que se muestre en pantalla sí o sí
          alert(this.errorMsg);

          console.error('detalle del error:', err);
        }
      });
  }


}
