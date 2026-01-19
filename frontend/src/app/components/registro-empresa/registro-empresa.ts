import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './registro-empresa.html',
  styleUrl: './registro-empresa.css'
})
export class RegistroEmpresaComponent implements OnInit {

  // Estados de la UI
  enviandoCodigo: boolean = false;
  codigoValido: boolean = false;
  codigoInvalido: boolean = false;
  correoVerificado: boolean = false;

  // Listas de ubicación
  provincias: any[] = [];
  ciudades: any[] = [];

  // Variables vinculadas al HTML (ngModel)
  correo: string = '';
  codigoVerificacion: string = '';
  contrasena: string = '';
  nombreEmpresa: string = '';
  ruc: string = '';
  sitioWeb: string = '';
  descripcion: string = '';

  idProvinciaSeleccionada: any = '';
  idCiudad: any = ''; // Este nombre debe coincidir con tu backend

  constructor(private http: HttpClient) {}

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

  // Carga de ciudades cuando cambia la provincia
  onProvinciaChange() {
    if (this.idProvinciaSeleccionada) {
      this.http.get<any[]>(`http://localhost:8080/api/ubicaciones/ciudades/${this.idProvinciaSeleccionada}`)
        .subscribe({
          next: (data) => {
            this.ciudades = data;
            this.idCiudad = ''; // Limpiamos la ciudad seleccionada anterior
          },
          error: (err) => console.error('Error al cargar ciudades', err)
        });
    }
  }

  // Registro final enviando el objeto que el Controller espera
  registrar() {
    const payload = {
      correo: this.correo,
      contrasena: this.contrasena,
      idCiudad: this.idCiudad,
      nombreEmpresa: this.nombreEmpresa,
      descripcion: this.descripcion,
      sitioWeb: this.sitioWeb,
      ruc: this.ruc
      // codigoIngresado: this.codigoVerificacion // Descomenta si tu backend lo valida aquí
    };

    this.http.post('http://localhost:8080/api/registro-empresa/crear', payload)
      .subscribe({
        next: (res: any) => {
          alert(res.mensaje || '¡Empresa registrada con éxito!');
        },
        error: (err) => {
          alert('Error: ' + (err.error?.error || 'Error en el servidor'));
        }
      });
  }

  // Métodos de apoyo para el código de verificación
  enviarCodigo() { /* Tu lógica de enviar código */ }
  validarCodigoVisual() {
    if (this.codigoVerificacion.length === 6) {
      this.codigoValido = true;
      this.correoVerificado = true;
    } else {
      this.codigoValido = false;
      this.correoVerificado = false;
    }
  }
}
