import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔥 1. Agregado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { UiNotificationService } from '../../services/ui-notification.service';

import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-registro-candidato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, HttpClientModule, GoogleSigninButtonModule],
  templateUrl: './registro-candidato.html',
  styleUrl: './registro-candidato.css'
})
export class RegistroCandidatoComponent implements OnInit {

  enviandoCodigo: boolean = false;
  codigoValido: boolean = false;
  codigoInvalido: boolean = false;
  correoVerificado: boolean = false;
  fechaMaxima: string = '';

  provincias: any[] = [];
  ciudades: any[] = [];


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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProvincias();
    this.configurarFechaMaxima();

    this.authService.authState.subscribe((user) => {
      if (user) {
        this.ui.info('Verificando cuenta con el servidor...');

        this.http.post<any>('http://localhost:8080/api/auth/email/google', {
          token: user.idToken
        }).subscribe({
          next: (res) => {
            if (res.status === 'success') {
              localStorage.setItem('token', res.token_sistema);
              localStorage.setItem('user', JSON.stringify(res.user));

              localStorage.setItem('idUsuario', res.user.idUsuario || res.user.id_usuario);
              localStorage.setItem('rol', res.user.rol || 'POSTULANTE');

              this.ui.exito(`¡Bienvenido, ${res.user.nombre}!`);

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
  configurarFechaMaxima() {
    const hoy = new Date();
    const hace18Anios = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    this.fechaMaxima = hace18Anios.toISOString().split('T')[0];
  }

  esMayorDeEdad(fecha: string): boolean {
    if (!fecha) return false;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 18;
  }

  cargarProvincias() {
    this.http.get<any[]>('http://localhost:8080/api/ubicaciones/provincias')
      .subscribe({
        next: (data) => {
          this.provincias = data;
          this.cdr.detectChanges();
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
            this.cdr.detectChanges();
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
    if (!this.esMayorDeEdad(this.fechaNac)) {
      this.ui.error('Debes ser mayor de 18 años para registrarte en la plataforma.');
      return;
    }

    if (!this.idCiudadSeleccionada) {
      this.ui.advertencia('Por favor, selecciona tu ubicación.');
      return;
    }
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
