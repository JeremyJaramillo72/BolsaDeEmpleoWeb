import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

// 1. Importamos tu servicio de autenticación
import { AuthService } from '../../services/auth.service';
import { UiNotificationService } from '../../services/ui-notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
// 2. Implementamos OnInit para ejecutar código apenas cargue el componente
export class LoginComponent implements OnInit {
  // variables vinculadas al formulario [(ngmodel)]
  correo: string = '';
  contrasena: string = '';

  // manejo de estados de la ui
  errorMsg: string = '';
  verPassword: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    // 3. Inyectamos el AuthService en el constructor
    private authService: AuthService,
    private ui: UiNotificationService
  ) {}

  // 4. Este método se dispara automáticamente al entrar a la vista del Login
  ngOnInit(): void {
    this.limpiarSesion();
  }

  /**
   * Cierra cualquier sesión que haya quedado colgada en el backend
   * y limpia el almacenamiento del navegador.
   */
  limpiarSesion(): void {
    // Limpiamos el localStorage por seguridad en el frontend
    localStorage.clear();

    // Llamamos al método logout de tu AuthService
    this.authService.logout().subscribe({
      next: () => console.log("⏪ Conexión de BD reseteada al default y sesión cerrada"),
      error: (err) => console.log('Nota: No había sesión activa en el backend o ya estaba cerrada.')
    });
  }

  togglePassword(): void {
    this.verPassword = !this.verPassword;
  }

  /**
   * envía las credenciales al backend de spring boot
   */
  onLogin() {
    this.errorMsg = '';
    const loginData = { correo: this.correo, contrasena: this.contrasena };

    this.http.post('http://localhost:8080/api/auth/login', loginData , { withCredentials: true })
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
          const msg = err.error?.error || 'Error de conexión con el servidor.';

          // toast inmediato (ya está dentro de Zone.js, no causa NG0100)
          this.ui.error(msg);

          // diferimos la asignación al template al siguiente tick para evitar NG0100
          setTimeout(() => { this.errorMsg = msg; }, 0);

          console.error('detalle del error:', err);
        }
      });
  }
}
