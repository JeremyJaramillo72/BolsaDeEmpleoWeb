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
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    // 3. Inyectamos el AuthService en el constructor
    private authService: AuthService,
    private ui: UiNotificationService
  ) {}

  // 4. Este método se dispara automáticamente al entrar a la vista del Login
  ngOnInit(): void {
    this.restaurarEstadoPagina();
    this.limpiarSesion();
  }

  /** Quita estilos del menú principal que pueden dejar la pantalla en blanco. */
  private restaurarEstadoPagina(): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = '';
    document.body.classList.remove('dark-mode');
  }

  /**
   * Limpia sesión anterior sin bloquear la UI del login.
   */
  limpiarSesion(): void {
    const clavesSesion = [
      'token', 'idUsuario', 'idRol', 'rol', 'nombre', 'permisosUi',
      'idEmpresa', 'idSesion', 'urlFoto'
    ];
    clavesSesion.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();

    this.authService.logout().subscribe({
      next: () => {},
      error: () => {}
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
    this.isLoading = true;
    const loginData = { correo: this.correo, contrasena: this.contrasena };

    this.http.post('http://localhost:8080/api/auth/login', loginData , { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          console.log('respuesta completa del backend:', res);

          localStorage.setItem('idUsuario', res.idUsuario);
          localStorage.setItem('idRol', res.rol?.idRol || res.idRol);
          const nombreCompleto = `${res.nombre || ''} ${res.apellido || ''}`.trim();
          localStorage.setItem('nombre', nombreCompleto);

          const permisosDelRol = res.rol?.permisosUi || '';
          localStorage.setItem('permisosUi', permisosDelRol);

          if (res.empresa && res.empresa.idEmpresa) {
            localStorage.setItem('idEmpresa', res.empresa.idEmpresa.toString());
          } else if (res.idEmpresa) {
            localStorage.setItem('idEmpresa', res.idEmpresa.toString());
          }

          let rolNombre = '';
          if (res.rol && typeof res.rol === 'object') {
            rolNombre = res.rol.nombreRol || res.rol.nombre || '';
          } else {
            rolNombre = res.rol || '';
          }

          localStorage.setItem('rol', rolNombre.trim().toUpperCase());

          if (res.token) {
            localStorage.setItem('token', res.token);
          }
          if (res.idSesion) {
            localStorage.setItem('idSesion', String(res.idSesion));
          }

          const rolLimpio = rolNombre.trim().toUpperCase();
          let rutaDashboard = '/menu-principal/dashboard-postulante';
          if (['ADMINISTRADOR', 'SUPERVISOR', 'GERENTE'].includes(rolLimpio)) {
            rutaDashboard = '/menu-principal/dashboard-admin';
          } else if (rolLimpio === 'EMPRESA') {
            rutaDashboard = '/menu-principal/dashboard-empresa';
          }

          this.isLoading = false;
          this.router.navigate([rutaDashboard]).then((success) => {
            if (!success) {
              this.ui.error('No se pudo abrir el panel. Recarga la página.');
            }
          });
        },
        error: (err) => {
          const msg = err.error?.error || 'Error de conexión con el servidor.';
          this.ui.error(msg);
          this.errorMsg = msg;
          this.isLoading = false;
          console.error('detalle del error:', err);
        }
      });
  }
}
