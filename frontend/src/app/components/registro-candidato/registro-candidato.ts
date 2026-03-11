import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 1. Agregado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { UiNotificationService } from '../../services/ui-notification.service';

// 🔥 Importaciones para el botón de Google
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-registro-candidato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, HttpClientModule, GoogleSigninButtonModule],
  templateUrl: './registro-candidato.html',
  styleUrl: './registro-candidato.css'
})
export class RegistroCandidatoComponent implements OnInit {

  // Variables para el flujo de validación
  enviandoCodigo: boolean = false;
  codigoValido: boolean = false;
  codigoInvalido: boolean = false;
  correoVerificado: boolean = false;

  // Listas para los combos dinámicos
  provincias: any[] = [];
  ciudades: any[] = [];

  // Datos del formulario vinculados a tu [(ngModel)]
  nombre: string = '';
  apellido: string = '';
  correo: string = '';
  codigoVerificacion: string = '';
  contrasena: string = '';
  telefono: string = '';
  genero: string = '';
  fechaNac: string = '';
  idProvinciaSeleccionada: number | null = null;
  idCiudadSeleccionada: number | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ui: UiNotificationService,
    private authService: SocialAuthService,
    private cdr: ChangeDetectorRef // 🔥 2. Inyectado para fixear el error de provincias
  ) {}

  ngOnInit() {
    this.cargarProvincias();

    // 🔥 3. FLUJO COMPLETO DE GOOGLE AL 100%
    this.authService.authState.subscribe((user) => {
      if (user) {
        this.ui.info('Verificando cuenta con el servidor...');

        // Enviamos el token de Google a tu API de Spring Boot
        this.http.post<any>('http://localhost:8080/api/auth/email/google', {
          token: user.idToken
        }).subscribe({
          next: (res) => {
            if (res.status === 'success') {
              // Guardamos el TOKEN de nuestro sistema y los datos del usuario
              localStorage.setItem('token', res.token_sistema);
              localStorage.setItem('user', JSON.stringify(res.user));

              // 🔥 Guardar idUsuario y rol para que AuthGuard valide correctamente
              localStorage.setItem('idUsuario', res.user.idUsuario || res.user.id_usuario);
              localStorage.setItem('rol', res.user.rol || 'POSTULANTE');

              this.ui.exito(`¡Bienvenido, ${res.user.nombre}!`);

              // Redirigimos al Dashboard del Postulante
              setTimeout(() => {
                this.router.navigate(['/menu-principal/dashboard-postulante']);
              }, 1500);
            }
          },
          error: (err) => {
            console.error('Error en el login:', err);
            this.ui.error('Error al sincronizar con el servidor. Intenta de nuevo.');
          }
        });
      }
    });
  }

  cargarProvincias() {
    this.http.get<any[]>('http://localhost:8080/api/ubicaciones/provincias')
      .subscribe({
        next: (data) => {
          this.provincias = data;
          this.cdr.detectChanges(); // 🔥 Fix para el error ExpressionChangedAfterItHasBeenChecked
        },
        error: (err) => console.error('Error al cargar provincias', err)
      });
  }

  onProvinciaChange() {
    if (this.idProvinciaSeleccionada) {
      this.http.get<any[]>(`http://localhost:8080/api/ubicaciones/ciudades/${this.idProvinciaSeleccionada}`)
        .subscribe({
          next: (data) => {
            this.ciudades = data;
            this.idCiudadSeleccionada = null;
            this.cdr.detectChanges(); // 🔥 También aquí por si acaso
          },
          error: (err) => console.error('Error al cargar ciudades', err)
        });
    }
  }

  enviarCodigo() {
    if (!this.correo) {
      this.ui.advertencia('Por favor, ingresa un correo válido');
      return;
    }
    this.enviandoCodigo = true;
    this.http.post('http://localhost:8080/api/auth/enviar-codigo', {Correo: this.correo})
      .subscribe({
        next: () => {
          this.enviandoCodigo = false;
          this.ui.info('Código enviado con éxito');
        },
        error: () => {
          this.enviandoCodigo = false;
          this.ui.error('Error al enviar el código');
        }
      });
  }

  validarCodigoVisual() {
    if (this.codigoVerificacion.length === 6) {
      this.codigoValido = true;
      this.codigoInvalido = false;
      this.correoVerificado = true;
    } else {
      this.codigoValido = false;
      this.correoVerificado = false;
    }
  }

  registrar() {
    const payload = {
      Nombre: this.nombre,
      Apellido: this.apellido,
      Telefono: this.telefono,
      Correo: this.correo,
      Contrasena: this.contrasena,
      Genero: this.genero,
      FechaNacimiento: this.fechaNac,
      idCiudad: this.idCiudadSeleccionada,
      codigoIngresado: this.codigoVerificacion
    };

    this.http.post('http://localhost:8080/api/registro-postulante/crear', payload)
      .subscribe({
        next: (res) => {
          this.ui.exito('¡Postulante registrado con éxito!');
          this.router.navigate(['/api/auth/login']);
        },
        error: (err) => {
          if (err.status === 400) {
            this.codigoInvalido = true;
            this.codigoValido = false;
            this.ui.error(err.error?.error || 'Código inválido');
          } else {
            this.ui.error('Error interno en el servidor');
          }
        }
      });
  }
}
