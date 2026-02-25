import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-reportes.html',
  styleUrls: ['./gestion-reportes.css']
})
export class GestionReportesComponent implements OnInit {
  // URLs sincronizadas con los RequestMapping del Backend
  private readonly API_OFERTAS = 'http://localhost:8080/api/reportes-ofertas/tabla';
  private readonly API_POSTULACIONES = 'http://localhost:8080/api/reporte-postulaciones/tabla';

  tipoReporte: 'ofertas' | 'postulaciones' = 'ofertas';
  resultados: any[] = [];
  columnas: string[] = [];
  estadisticas: { etiqueta: string, cantidad: number, porcentaje: number }[] = [];

  cargando = false;
  mostrandoResultados = false;
  mostrandoGrafico = false;

  // Filtros inicializados para evitar 'undefined' en HttpParams
  filtrosOfertas: any = { idCiudad: null, idCategoria: null, busqueda: '' };
  filtrosPostulaciones: any = { idOferta: null, estado: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.limpiar();
  }

  cambiarTipoReporte(tipo: 'ofertas' | 'postulaciones') {
    this.tipoReporte = tipo;
    this.limpiar();
  }

  limpiar() {
    this.resultados = [];
    this.columnas = [];
    this.estadisticas = [];
    this.mostrandoResultados = false;
    this.mostrandoGrafico = false;
    this.cargando = false;
    this.filtrosOfertas = { idCiudad: null, idCategoria: null, busqueda: '' };
    this.filtrosPostulaciones = { idOferta: null, estado: '' };
  }

  /**
   * Obtiene los datos del servidor y prepara la tabla.
   */
  vistaPrevia() {
    this.cargando = true;
    this.mostrandoResultados = false;
    this.mostrandoGrafico = false; // Reset de estadísticas al buscar de nuevo

    const url = this.tipoReporte === 'ofertas' ? this.API_OFERTAS : this.API_POSTULACIONES;
    const f = this.tipoReporte === 'ofertas' ? this.filtrosOfertas : this.filtrosPostulaciones;

    let params = new HttpParams();
    Object.keys(f).forEach(key => {
      if (f[key] !== null && f[key] !== undefined && f[key] !== '') {
        params = params.set(key, f[key].toString());
      }
    });

    this.http.get<any>(url, { params }).subscribe({
      next: (res) => {
        // LÓGICA ESTRICTA DE DESESTRUCTURACIÓN:
        // Ofertas devuelve el array directamente.
        // Postulaciones devuelve un objeto { datos: [...], total: X }.
        let dataRaw = this.tipoReporte === 'postulaciones' ? res.datos : res;

        if (Array.isArray(dataRaw)) {
          this.resultados = dataRaw;
          if (this.resultados.length > 0) {
            // Extraer nombres de columnas del primer objeto, ignorando metadatos técnicos
            this.columnas = Object.keys(this.resultados[0]).filter(c => c !== 'totalRegistros');
            // IMPORTANTE: Pre-calculamos las estadísticas para que el botón funcione al instante
            this.generarDataGrafico(this.resultados);
            this.mostrandoResultados = true;
          } else {
            alert("Atención: No hay datos para los filtros seleccionados.");
          }
        }
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error Crítico del Servidor (500):", err);
        const mensajeBaseDatos = err.error?.error || "Error interno. Verifique que la función SQL y los tipos de datos en Java coincidan.";
        alert(`FALLO EN EL SERVIDOR: ${mensajeBaseDatos}`);
        this.cargando = false;
      }
    });
  }

  /**
   * Lógica para el botón de Estadísticas.
   * Procesa el array de 'resultados' que ya está en memoria.
   */
  private generarDataGrafico(data: any[]) {
    // Definimos qué campo vamos a agrupar según el DTO de Java
    // Ofertas -> categoria | Postulaciones -> estadoValidacion
    const campoAgrupar = this.tipoReporte === 'ofertas' ? 'categoria' : 'estadoValidacion';

    // 1. Contar frecuencias
    const counts = data.reduce((acc: any, curr: any) => {
      const valor = curr[campoAgrupar] || 'No definido';
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {});

    // 2. Determinar el valor máximo para calcular porcentajes visuales (CSS width)
    const valoresFrecuencia = Object.values(counts) as number[];
    const max = Math.max(...valoresFrecuencia) || 1;

    // 3. Mapear al formato que lee el HTML
    this.estadisticas = Object.keys(counts).map(key => ({
      etiqueta: key,
      cantidad: counts[key],
      porcentaje: (counts[key] / max) * 100
    }));
  }

  /**
   * Alterna la vista entre Tabla y Gráfico
   */
  toggleEstadisticas() {
    if (this.resultados.length === 0) {
      alert("Primero debe cargar datos con 'Vista Previa'");
      return;
    }
    this.mostrandoGrafico = !this.mostrandoGrafico;
  }
}
