import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RouterLink, Router} from '@angular/router';

@Component({
  selector: 'app-registro-candidato',
  standalone: true,
  // Importamos FormsModule para que [(ngModel)] funcione con tu HTML actual
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './registro-candidato.html',
  styleUrl: './registro-candidato.css'
})
export class RegistroCandidatoComponent implements OnInit {

  // Variables para el flujo de validación de tu HTML
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

  constructor(private http: HttpClient, private router: Router) {
  }

  ngOnInit() {
    this.cargarProvincias();
  }

  cargarProvincias() {
    this.http.get<any[]>('http://localhost:8080/api/ubicaciones/provincias')
      .subscribe({
        next: (data) => this.provincias = data,
        error: (err) => console.error('Error al cargar provincias', err)
      });
  }

  onProvinciaChange() {
    if (this.idProvinciaSeleccionada) {
      this.http.get<any[]>(`http://localhost:8080/api/ubicaciones/ciudades/${this.idProvinciaSeleccionada}`)
        .subscribe({
          next: (data) => {
            this.ciudades = data;
            this.idCiudadSeleccionada = null; // Reiniciar ciudad al cambiar provincia
          },
          error: (err) => console.error('Error al cargar ciudades', err)
        });
    }
  }

  enviarCodigo() {
    if (!this.correo) {
      alert('Por favor, ingresa un correo válido');
      return;
    }
    this.enviandoCodigo = true;
    this.http.post('http://localhost:8080/api/auth/enviar-codigo', {Correo: this.correo})
      .subscribe({
        next: () => {
          this.enviandoCodigo = false;
          alert('Código enviado con éxito');
        },
        error: () => {
          this.enviandoCodigo = false;
          alert('Error al enviar el código');
        }
      });
  }

  // 4. Lógica visual para el input del código
  validarCodigoVisual() {
    if (this.codigoVerificacion.length === 6) {
      // Aquí podrías llamar a una validación rápida o esperar al registro
      this.codigoValido = true;
      this.codigoInvalido = false;
      this.correoVerificado = true; // Habilita el botón de registro
    } else {
      this.codigoValido = false;
      this.correoVerificado = false;
    }
  }

  // 5. Método de registro final
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
          alert('¡Postulante registrado con éxito!');
          this.router.navigate(['/api/auth/login']);
        },
        error: (err) => {
          // AQUÍ ES DONDE CAPTURAS LA EXPIRACIÓN O CÓDIGO INCORRECTO
          if (err.status === 400) {
            this.codigoInvalido = true;
            this.codigoValido = false;
            // Mostramos el mensaje exacto que configuraste en Java:
            // "El código de verificación es incorrecto o ya expiró."
            alert(err.error?.error || 'Código inválido');
          } else {
            alert('Error interno en el servidor');
          }
        }
      });
  }
}
