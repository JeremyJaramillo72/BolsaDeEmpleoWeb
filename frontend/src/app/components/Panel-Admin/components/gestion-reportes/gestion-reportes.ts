import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  templateUrl: './gestion-reportes.html',
  styleUrls: ['./gestion-reportes.css'],
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    HttpClientModule
  ]
})
export class GestionReportesComponent {

  private API = 'http://localhost:8080/api/reportes';

  constructor(private http: HttpClient) {}

  tipoReporte: 'ofertas'|'postulaciones'|'usuarios' = 'ofertas';

  resultados: any[] = [];
  columnas: string[] = [];
  mostrandoResultados = false;
  cargando = false;
  mensajeError = '';

  filtrosOfertas = {
    estado: '',
    categoria: '',
    ciudad: ''
  };

  filtrosPostulaciones = {
    estadoValidacion: ''
  };

  filtrosUsuarios = {
    correo: ''
  };

  cambiarTipoReporte(tipo: 'ofertas'|'postulaciones'|'usuarios') {
    this.tipoReporte = tipo;
    this.limpiar();
  }

  limpiar() {
    this.resultados = [];
    this.columnas = [];
    this.mostrandoResultados = false;
    this.mensajeError = '';
  }

  vistaPrevia() {

    this.cargando = true;
    this.mensajeError = '';
    this.mostrandoResultados = false;

    if (this.tipoReporte === 'ofertas') {
      this.getOfertas();
    }

    if (this.tipoReporte === 'postulaciones') {
      this.getPostulaciones();
    }

    if (this.tipoReporte === 'usuarios') {
      this.getUsuarios();
    }
  }

  private getOfertas() {

    let params = new HttpParams();

    if (this.filtrosOfertas.estado)
      params = params.set('estado', this.filtrosOfertas.estado);

    if (this.filtrosOfertas.categoria)
      params = params.set('categoria', this.filtrosOfertas.categoria);

    if (this.filtrosOfertas.ciudad)
      params = params.set('ciudad', this.filtrosOfertas.ciudad);

    this.http.get<any[]>(`${this.API}/ofertas`, { params })
      .subscribe({
        next: data => this.procesarRespuesta(data),
        error: err => this.manejarError(err)
      });
  }

  private getPostulaciones() {

    let params = new HttpParams();

    if (this.filtrosPostulaciones.estadoValidacion)
      params = params.set('estadoValidacion', this.filtrosPostulaciones.estadoValidacion);

    this.http.get<any[]>(`${this.API}/postulaciones`, { params })
      .subscribe({
        next: data => this.procesarRespuesta(data),
        error: err => this.manejarError(err)
      });
  }

  private getUsuarios() {

    let params = new HttpParams();

    if (this.filtrosUsuarios.correo)
      params = params.set('correo', this.filtrosUsuarios.correo);

    this.http.get<any[]>(`${this.API}/usuarios`, { params })
      .subscribe({
        next: data => this.procesarRespuesta(data),
        error: err => this.manejarError(err)
      });
  }

  private procesarRespuesta(data: any[]) {
    this.resultados = data ?? [];

    if (this.resultados.length > 0) {
      this.columnas = Object.keys(this.resultados[0]);
    } else {
      this.columnas = [];
    }

    this.mostrandoResultados = true;
    this.cargando = false;
  }

  private manejarError(error: any) {
    console.error(error);
    this.mensajeError = 'Error al obtener el reporte';
    this.cargando = false;
  }

  exportarPDF() {

    if (this.resultados.length === 0) {
      this.mensajeError = 'No hay datos para exportar';
      return;
    }

    const doc = new jsPDF();

    autoTable(doc, {
      head: [this.columnas],
      body: this.resultados.map(r =>
        this.columnas.map(c => r[c])
      ),
      styles: { fontSize: 8 }
    });

    doc.save(`reporte_${this.tipoReporte}.pdf`);
  }

}
