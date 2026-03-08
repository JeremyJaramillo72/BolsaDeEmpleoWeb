import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';

// ✅ Registrar todos los componentes de Chart.js una sola vez al cargar el módulo
Chart.register(...registerables);

// ─── Interfaces de Catálogos ────────────────────────────────────────────────
interface CiudadDTO    { idCiudad: number;    nombreCiudad: string;    nombreProvincia: string; }
interface CategoriaDTO { idCategoria: number; nombreCategoria: string; }
interface ModalidadDTO { idModalidad: number; nombreModalidad: string; }
interface JornadaDTO   { idJornada: number;   nombreJornada: string;   }

// ─── Interface de Estadísticas (se mantiene para exportar Excel) ─────────────
interface GraficoData {
  titulo: string;
  datos: { etiqueta: string; cantidad: number; porcentaje: number; color: string }[];
}

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './gestion-reportes.html',
  styleUrls: ['./gestion-reportes.css']
})
export class GestionReportesComponent implements OnInit, OnDestroy {

  // ─── URLs del Backend ───────────────────────────────────────────────────
  private readonly API_BASE          = 'http://localhost:8080/api';
  private readonly API_OFERTAS       = `${this.API_BASE}/reportes/ofertas`;
  private readonly API_POSTULACIONES = `${this.API_BASE}/reportes/postulaciones`;
  private readonly API_CIUDADES      = `${this.API_BASE}/ciudades`;
  private readonly API_CATEGORIAS    = `${this.API_BASE}/categorias`;
  private readonly API_MODALIDADES   = `${this.API_BASE}/modalidades`;
  private readonly API_JORNADAS      = `${this.API_BASE}/jornadas`;

  // ─── Estado Principal ───────────────────────────────────────────────────
  tipoReporte: 'ofertas' | 'postulaciones' = 'ofertas';
  resultados:  any[]         = [];
  columnas:    string[]      = [];
  graficos:    GraficoData[] = [];

  cargando            = false;
  mostrandoResultados = false;
  mostrandoGrafico    = false;

  // ─── Alertas ────────────────────────────────────────────────────────────
  mensajeExito = '';
  mensajeError = '';

  // ─── Paginación ─────────────────────────────────────────────────────────
  paginaActual   = 1;
  itemsPorPagina = 10;

  // ─── Catálogos ──────────────────────────────────────────────────────────
  ciudades:    CiudadDTO[]    = [];
  categorias:  CategoriaDTO[] = [];
  modalidades: ModalidadDTO[] = [];
  jornadas:    JornadaDTO[]   = [];

  estadosOfertas     = ['aprobado', 'pendiente', 'rechazada'];
  estadosPostulacion = ['Pendiente', 'Revisado', 'Aceptado', 'Rechazado'];

  // ─── Filtros Ofertas ────────────────────────────────────────────────────
  filtrosOfertas = {
    idCiudad:     null as number | null,
    idCategoria:  null as number | null,
    idModalidad:  null as number | null,
    idJornada:    null as number | null,
    fechaInicio:  '',
    fechaFin:     '',
    salarioMin:   null as number | null,
    salarioMax:   null as number | null,
    estadoOferta: ''
  };

  // ─── Filtros Postulaciones ───────────────────────────────────────────────
  filtrosPostulaciones = {
    idCiudad:         null as number | null,
    idCategoria:      null as number | null,
    idModalidad:      null as number | null,
    estadoValidacion: '',
    fechaInicio:      '',
    fechaFin:         ''
  };

  // ─── Comboboxes buscables ────────────────────────────────────────────────
  ciudadSearch        = 'Todos';
  ciudadOpen          = false;
  ciudadSeleccionada: CiudadDTO | null = null;

  categoriaSearch        = 'Todos';
  categoriaOpen          = false;
  categoriaSeleccionada: CategoriaDTO | null = null;

  modalidadSearch        = 'Todos';
  modalidadOpen          = false;
  modalidadSeleccionada: ModalidadDTO | null = null;

  jornadaSearch        = 'Todos';
  jornadaOpen          = false;
  jornadaSeleccionada: JornadaDTO | null = null;

  // ─── Validaciones UI ────────────────────────────────────────────────────
  erroresFiltros: string[] = [];

  // ─── Instancias de Chart.js ─────────────────────────────────────────────
  // ✅ Se guardan para destruirlas antes de recrear (evita "Canvas is already in use")
  private chartsInstances: Chart[] = [];

  // ─── Getters: filtrado de comboboxes ────────────────────────────────────
  get ciudadesFiltradas(): CiudadDTO[] {
    if (!this.ciudadSearch || this.ciudadSearch === 'Todos') return this.ciudades;
    return this.ciudades.filter(c =>
      `${c.nombreCiudad} ${c.nombreProvincia}`.toLowerCase().includes(this.ciudadSearch.toLowerCase())
    );
  }
  get categoriasFiltradas(): CategoriaDTO[] {
    if (!this.categoriaSearch || this.categoriaSearch === 'Todos') return this.categorias;
    return this.categorias.filter(c =>
      c.nombreCategoria.toLowerCase().includes(this.categoriaSearch.toLowerCase())
    );
  }
  get modalidadesFiltradas(): ModalidadDTO[] {
    if (!this.modalidadSearch || this.modalidadSearch === 'Todos') return this.modalidades;
    return this.modalidades.filter(m =>
      m.nombreModalidad.toLowerCase().includes(this.modalidadSearch.toLowerCase())
    );
  }
  get jornadasFiltradas(): JornadaDTO[] {
    if (!this.jornadaSearch || this.jornadaSearch === 'Todos') return this.jornadas;
    return this.jornadas.filter(j =>
      j.nombreJornada.toLowerCase().includes(this.jornadaSearch.toLowerCase())
    );
  }

  // ─── Getters: paginación ────────────────────────────────────────────────
  get resultadosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.resultados.slice(inicio, inicio + this.itemsPorPagina);
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.resultados.length / this.itemsPorPagina));
  }
  get hoyISO(): string { return new Date().toISOString().split('T')[0]; }

  constructor(
    private http:   HttpClient,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  // ✅ Destruir charts al destruir el componente para evitar memory leaks
  ngOnDestroy(): void {
    this.destruirCharts();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGA DE CATÁLOGOS
  // ═══════════════════════════════════════════════════════════════════════════
  cargarCatalogos(): void {
    this.http.get<CiudadDTO[]>(this.API_CIUDADES).subscribe({
      next: data => this.ngZone.run(() => { this.ciudades    = data; this.cdr.detectChanges(); }),
      error: err  => console.error('Error al cargar ciudades:', err)
    });
    this.http.get<CategoriaDTO[]>(this.API_CATEGORIAS).subscribe({
      next: data => this.ngZone.run(() => { this.categorias  = data; this.cdr.detectChanges(); }),
      error: err  => console.error('Error al cargar categorías:', err)
    });
    this.http.get<ModalidadDTO[]>(this.API_MODALIDADES).subscribe({
      next: data => this.ngZone.run(() => { this.modalidades = data; this.cdr.detectChanges(); }),
      error: err  => console.error('Error al cargar modalidades:', err)
    });
    this.http.get<JornadaDTO[]>(this.API_JORNADAS).subscribe({
      next: data => this.ngZone.run(() => { this.jornadas    = data; this.cdr.detectChanges(); }),
      error: err  => console.error('Error al cargar jornadas:', err)
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROL DE TIPO DE REPORTE Y LIMPIEZA
  // ═══════════════════════════════════════════════════════════════════════════
  cambiarTipoReporte(tipo: 'ofertas' | 'postulaciones'): void {
    this.tipoReporte = tipo;
    this.limpiar();
  }

  limpiar(): void {
    this.destruirCharts();
    this.resultados          = [];
    this.columnas            = [];
    this.graficos            = [];
    this.mostrandoResultados = false;
    this.mostrandoGrafico    = false;
    this.cargando            = false;
    this.paginaActual        = 1;
    this.erroresFiltros      = [];
    this.mensajeExito        = '';
    this.mensajeError        = '';

    this.filtrosOfertas = {
      idCiudad: null, idCategoria: null, idModalidad: null, idJornada: null,
      fechaInicio: '', fechaFin: '', salarioMin: null, salarioMax: null,
      estadoOferta: ''
    };
    this.filtrosPostulaciones = {
      idCiudad: null, idCategoria: null, idModalidad: null,
      estadoValidacion: '', fechaInicio: '', fechaFin: ''
    };

    this.ciudadSeleccionada    = null; this.ciudadSearch    = 'Todos'; this.ciudadOpen    = false;
    this.categoriaSeleccionada = null; this.categoriaSearch = 'Todos'; this.categoriaOpen = false;
    this.modalidadSeleccionada = null; this.modalidadSearch = 'Todos'; this.modalidadOpen = false;
    this.jornadaSeleccionada   = null; this.jornadaSearch   = 'Todos'; this.jornadaOpen   = false;

    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════════════════
  private validarFiltros(): boolean {
    this.erroresFiltros = [];
    const f = this.tipoReporte === 'ofertas' ? this.filtrosOfertas : this.filtrosPostulaciones;

    if (f.fechaInicio && f.fechaFin && new Date(f.fechaFin) < new Date(f.fechaInicio))
      this.erroresFiltros.push('La fecha fin no puede ser anterior a la fecha inicio.');
    if (f.fechaInicio && f.fechaInicio > this.hoyISO)
      this.erroresFiltros.push('La fecha inicio no puede ser una fecha futura.');
    if (f.fechaFin && f.fechaFin > this.hoyISO)
      this.erroresFiltros.push('La fecha fin no puede ser una fecha futura.');

    if (this.tipoReporte === 'ofertas') {
      const fo = this.filtrosOfertas;
      if (fo.salarioMin !== null && fo.salarioMin < 0)
        this.erroresFiltros.push('El salario mínimo no puede ser negativo.');
      if (fo.salarioMax !== null && fo.salarioMax < 0)
        this.erroresFiltros.push('El salario máximo no puede ser negativo.');
      if (fo.salarioMin !== null && fo.salarioMax !== null && fo.salarioMax < fo.salarioMin)
        this.erroresFiltros.push('El salario máximo no puede ser menor al salario mínimo.');
    }
    return this.erroresFiltros.length === 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA PREVIA
  // ═══════════════════════════════════════════════════════════════════════════
  vistaPrevia(): void {
    if (!this.validarFiltros()) return;

    this.destruirCharts();
    this.cargando            = true;
    this.mostrandoResultados = false;
    this.mostrandoGrafico    = false;
    this.cdr.detectChanges();

    const url    = this.tipoReporte === 'ofertas' ? this.API_OFERTAS : this.API_POSTULACIONES;
    const filtro = this.tipoReporte === 'ofertas' ? this.filtrosOfertas : this.filtrosPostulaciones;

    let params = new HttpParams();
    Object.keys(filtro).forEach(key => {
      const val = (filtro as any)[key];
      if (val !== null && val !== undefined && val !== '')
        params = params.set(key, val.toString());
    });

    this.http.get<any[]>(url, { params }).subscribe({
      next: data => {
        this.ngZone.run(() => {
          this.resultados = Array.isArray(data) ? data : [];
          if (this.resultados.length > 0) {
            this.columnas            = Object.keys(this.resultados[0]);
            this.generarGraficos(this.resultados);
            this.mostrandoResultados = true;
            this.paginaActual        = 1;
            this.mostrarExito(`Se encontraron ${this.resultados.length} registros.`);
          } else {
            this.mostrarError('No se encontraron datos para los filtros seleccionados.');
          }
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: err => {
        this.ngZone.run(() => {
          const msg = err.error?.error || err.error?.message || 'Error al conectar con el servidor.';
          this.mostrarError(msg);
          console.error(err);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS — muestra los gráficos Chart.js
  // ═══════════════════════════════════════════════════════════════════════════
  verEstadisticas(): void {
    if (this.resultados.length === 0) {
      this.vistaPrevia();
      const check = setInterval(() => {
        if (!this.cargando) {
          clearInterval(check);
          if (this.resultados.length > 0) {
            this.ngZone.run(() => {
              this.mostrandoGrafico    = true;
              this.mostrandoResultados = false;
              this.cdr.detectChanges();
              // ✅ Esperar que Angular renderice los canvas antes de inicializar Chart.js
              setTimeout(() => this.crearCharts(), 100);
            });
          }
        }
      }, 200);
      return;
    }
    this.mostrandoGrafico    = true;
    this.mostrandoResultados = false;
    this.cdr.detectChanges();
    // ✅ Esperar que Angular renderice los canvas antes de inicializar Chart.js
    setTimeout(() => this.crearCharts(), 100);
  }

  verTabla(): void {
    this.destruirCharts();
    this.mostrandoGrafico    = false;
    this.mostrandoResultados = true;
    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHART.JS — destruir instancias anteriores
  // ═══════════════════════════════════════════════════════════════════════════
  destruirCharts(): void {
    this.chartsInstances.forEach(c => c.destroy());
    this.chartsInstances = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHART.JS — crear instancias según tipo de reporte
  //
  // Asignación de tipos de gráfico:
  //   Ofertas:       [0] Categoría → Doughnut
  //                  [1] Ciudad    → Barra Horizontal
  //                  [2] Modalidad → Barra Vertical
  //   Postulaciones: [0] Estado    → Doughnut
  //                  [1] Categoría → Barra Vertical
  //                  [2] Ciudad    → Barra Horizontal
  // ═══════════════════════════════════════════════════════════════════════════
  crearCharts(): void {
    this.destruirCharts();

    // Paleta de colores profesional con transparencia para fondos
    const SOLID: string[] = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
      '#f97316', '#eab308', '#22c55e', '#14b8a6',
      '#06b6d4', '#3b82f6'
    ];
    const ALPHA = (hex: string, a: number): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    };

    // Fuente global
    Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', sans-serif";

    this.graficos.forEach((grafico, index) => {
      const canvas = document.getElementById(`chart-${index}`) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`Canvas chart-${index} no encontrado en el DOM`);
        return;
      }

      const labels   = grafico.datos.map(d => d.etiqueta);
      const values   = grafico.datos.map(d => d.cantidad);
      const solid    = labels.map((_, i) => SOLID[i % SOLID.length]);
      const bg       = labels.map((_, i) => ALPHA(SOLID[i % SOLID.length], 0.75));
      const total    = values.reduce((a, b) => a + b, 0);

      // Determinar tipo según índice y tipo de reporte
      const esHorizontal =
        (this.tipoReporte === 'ofertas'       && index === 1) ||
        (this.tipoReporte === 'postulaciones' && index === 2);
      const esDoughnut = index === 0;

      let chart: Chart;

      if (esDoughnut) {
        // ── DOUGHNUT ──────────────────────────────────────────────────────
        chart = new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: bg,
              borderColor: solid,
              borderWidth: 2,
              hoverOffset: 12,
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            animation: { animateRotate: true, duration: 900, easing: 'easeInOutQuart' },
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  font: { size: 12, weight: 500 },
                  padding: 18,
                  usePointStyle: true,
                  pointStyleWidth: 12,
                  color: '#374151'
                }
              },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont:  { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx: any) => {
                    const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
                    return `  ${ctx.label}: ${ctx.parsed}  (${pct}%)`;
                  }
                }
              }
            }
          }
        });

      } else if (esHorizontal) {
        // ── BARRA HORIZONTAL (Ciudad) ─────────────────────────────────────
        chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: grafico.titulo,
              data: values,
              backgroundColor: bg,
              borderColor: solid,
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false
            }]
          },
          options: {
            indexAxis: 'y' as const,
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont:  { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx: any) => `  Cantidad: ${ctx.formattedValue}`
                }
              }
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 11 }, color: '#6b7280' },
                border: { dash: [4, 4], display: false }
              },
              y: {
                grid: { display: false },
                ticks: {
                  font: { size: 11 },
                  color: '#374151',
                  // Truncar etiquetas largas de ciudad
                  callback: (val: any, i: number) => {
                    const lbl = labels[i] ?? '';
                    return lbl.length > 20 ? lbl.substring(0, 18) + '…' : lbl;
                  }
                }
              }
            }
          }
        });

      } else {
        // ── BARRA VERTICAL (Modalidad / Categoría postulaciones) ──────────
        chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: grafico.titulo,
              data: values,
              backgroundColor: bg,
              borderColor: solid,
              borderWidth: 2,
              borderRadius: 10,
              borderSkipped: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' },
                bodyFont:  { size: 12 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (ctx: any) => `  Cantidad: ${ctx.formattedValue}`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 11 }, color: '#6b7280' },
                border: { dash: [4, 4], display: false }
              },
              x: {
                grid: { display: false },
                ticks: {
                  font: { size: 11 },
                  color: '#374151',
                  maxRotation: 30,
                  callback: (val: any, i: number) => {
                    const lbl = labels[i] ?? '';
                    return lbl.length > 15 ? lbl.substring(0, 13) + '…' : lbl;
                  }
                }
              }
            }
          }
        });
      }

      this.chartsInstances.push(chart);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERACIÓN DE DATOS para gráficos (se sigue usando en exportar Excel y PDF)
  // ═══════════════════════════════════════════════════════════════════════════
  private generarGraficos(data: any[]): void {
    this.graficos = [];
    const colores = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
    ];
    const crearGrafico = (titulo: string, campo: string): GraficoData => {
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const val = row[campo] || 'No definido';
        counts[val] = (counts[val] || 0) + 1;
      });
      const max = Math.max(...Object.values(counts)) || 1;
      return {
        titulo,
        datos: Object.keys(counts)
          .map((key, i) => ({
            etiqueta:   key,
            cantidad:   counts[key],
            porcentaje: (counts[key] / max) * 100,
            color:      colores[i % colores.length]
          }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 10)
      };
    };

    if (this.tipoReporte === 'ofertas') {
      this.graficos.push(crearGrafico('Ofertas por Categoría', 'nombreCategoria'));
      this.graficos.push(crearGrafico('Ofertas por Ciudad',    'nombreCiudad'));
      this.graficos.push(crearGrafico('Ofertas por Modalidad', 'nombreModalidad'));
    } else {
      this.graficos.push(crearGrafico('Postulaciones por Estado',    'estadoValidacion'));
      this.graficos.push(crearGrafico('Postulaciones por Categoría', 'nombreCategoria'));
      this.graficos.push(crearGrafico('Postulaciones por Ciudad',    'nombreCiudad'));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTAR PDF
  // ═══════════════════════════════════════════════════════════════════════════
  // Estrategia de ajuste de columnas (NUNCA se parten columnas):
  //   1. A4 landscape (297×210 mm), márgenes 6 mm → ancho útil 285 mm
  //   2. Calcular ancho mínimo de cada columna según header + dato más largo
  //   3. Reducir fuente de 8pt → 7pt → 6pt → 5pt hasta que quepan todas
  //   4. Si con 5pt aún no caben, comprimir proporcionalmente (forzar fit)
  //   5. Distribuir espacio sobrante proporcionalmente entre columnas
  //   6. Header: logo izquierda + título + nombre admin + fecha (derecha)
  //   7. Footer: línea divisora + "Página X de N" a la derecha
  //   8. Última página: gráficos estadísticos
  // ═══════════════════════════════════════════════════════════════════════════
  async exportarPDF(): Promise<void> {
    if (this.resultados.length === 0) await this.ejecutarVistaPreviaAsync();
    if (this.resultados.length === 0) { this.mostrarError('No hay datos para exportar.'); return; }

    try {
      const jsPDFModule = await import('jspdf');
      const html2canvas  = (await import('html2canvas')).default;
      const { jsPDF }    = jsPDFModule;

      // ── Constantes de layout ────────────────────────────────────────────
      const PAGE_W       = 297;
      const PAGE_H       = 210;
      const MARGIN       = 6;
      const USABLE_W     = PAGE_W - MARGIN * 2;   // 285 mm
      const HEADER_H     = 26;
      const FOOTER_H     = 8;
      const COL_PAD      = 1.5;
      const MAX_CHARS    = 32;
      const CHAR_W_RATIO = 1.75;                  // mm por carácter a 8pt (Helvetica)

      const titulo = this.tipoReporte === 'ofertas'
        ? 'Reporte de Ofertas Laborales'
        : 'Reporte de Postulaciones';

      // ── Nombre admin desde localStorage ────────────────────────────────
      const nombreAdmin =
        localStorage.getItem('nombreUsuario') ||
        localStorage.getItem('nombre')        ||
        localStorage.getItem('username')      ||
        localStorage.getItem('user')          || '';

      // ── Logo embebido como base64 ─────────────────────────────────────────
      // ✅ Sin dependencia de rutas ni del servidor — funciona siempre
      const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAajUlEQVR42u2deZRcd3XnP/f3Xi1dvbdae0tueZG8YOMlttmMyZyYzTjYTswyiUlCWMwY8CQDM0k4wISBBMhhTjI5E/uQiQnhQJwYExwwCRwbSAjCji1keZO8abG1q/euru293+/OH+9V1avqakl2jFQl6neOddzd1VWv3/d37+/e7/3e+8S5UOmujl4CLAWiDyAiAKgu8TLt7oH2RliW/JE52q7ors5YqgqqLTEzDS9qZbld6+0soI/XgrULbMeCnMTO74J56gVcx7TgLuCnhCkf3UV316mxTCvkuxH0qWPFXQv+ubPg7uoC3F1dgLurLQHupkddC+6uLsDd1QW4u7oAd1cX4BezlKXVD6fi8n+egD3a13BqihxOXQsWqVnrz3Py55+q4AIYkaMr0ljCjLX+K9rhxRf/VAUXhIpzlAMLSFzj1vglEv1vC+ScQMbzyPomAleaEO8C3C44C8XAMlcI8IwX41MHuIqvNCFn1WFTStZPN5q10JFMn39qWW1jCCUIxhOcKqFr/LnEvlhqr40iEk8k8Xba+nM6CGi/k0CU+Ex0iRtfBUprx2dkl141vBKPB/dMMTFfwjcCrjFiVqljF1rlF8aHOX15b+SV1SwCWST+p0NA9jvJQhUQ4+EdM+zROujOsX64h9FcClM7TqPtkDTIqoEPZNOoU5A4SGv4rIRisUNAlobWlTa7YKXedVE1u6cO55mcK2NEI6Ai1OsWiRJY5dzVg+QyPpMLFbK+h6v6YDT6MyV206p4RiLwUSoh5NIGVcsT++cxJgq2nMLYUJb1y/pQdfWAu81B7ggLVgVjDNsPzPLwvhmGcxlUkwGS1jaAp1AMlULg6MuCiOGB56aZylfwpBpNC0oUITtV0p7hVWeMkPYNzilGDHMlx46DC/i+gDMg8OyhBX7xHGFsuBfnXEcwI20NsCQ8tHOWPZNzXLJ+hJH+NNYqnhiMMYBDBKxTDIK10J/1CJ3DiDLamyHjGbzYrSqg8ZlugbQneMZg4jQJIOUZBnM+nomuJAgdxdDw1KE8Y8O5xuOjja24vS04ds8iULGK4JHxDZWKRYBAHU/szzNXDjlndR8r+jJUrIvPWFOz/jNHe+NgrO5SVaQhmnY2cveCEFpY1pfl6petRkUxIuydKvCTnVMUA4tVxZNE+NXGIHdWmhQHSSLgG8MzB+bZOVnEM8K25+d47cZR0gI2vteegBEltGHNH2gi6o6+FYFj4ui4+n0jSiZlIleOsGowg4gQWBdh2RxgtynIHZYHK1XiMHTKkYUKGU9JGaEchMwVK6zsz2JDi1PoSXuMeqYh+zVEAFVdNA3neExxGgG19c0gPqqGkZxP1o8DOpVFeXc7gux3mgFX76cYMAJOY7pCm29wBE+q6kurlGPVdbv4K7NEpKTVNEoARy5teP3LVsaRt0FrLJi2NYvpdxq41RzWCKwa6OHwTJFC6FjWn2akJ0XoGklmp9FGCJ0ynS9HDlegN5tGgIVCBRefvYriXHwGaAsmq0p4ahSd+54wlEvhSRfglyQnVpUaU1UJlfHlffieMFcM2LiyDw8Ia4FT4/ZwzlIILEYMvhE+9g9bKIXwsavPQzCoc6Q8j74eP+GutcnjRmZvxCfQkHwxwKmPb6T+ujZz0367khzHAtv3PGYKZeZKFUIn7J8pMzbcg1dnIxefkQgD2RTfffQ5/vSfd4Aql6wf4G2XnkGhHLJ/Zp6/e3gvKgaJyZC6awdxkTeoBJbTl/dx/YVjbV9l6sAoWvGNx+RChft3TRKGDgPsdjC5UOaS00bA2ibXXk+RPKMczBcj4MSwd7qAQUj7Pk8fmedz/7SDdNpHnW1y0Yq66GioVEIuHx/muovWN+6ftga4A7hVV8+U2HFwjooloiFV8Tx4fqrIumVFVvRnEzWiRLe7gfmS5ZfOW8erz3qOUqBcd9EGChVLxVpeu2kNez97HVZcVNzQuouO4jSlUgnJV0L60mmc0yiYlvYFubMsWKOoN7AOCwxm/SgmljhitpAvWVb21294PdqtxtWO4Z4UN776TELnGB3I4dThe4apuRL3PnsAkXo5o5o1iyql0PLyNcNctn6UQhCirktVvsT4GqyFlIHLTxtJnKxaC62MRAFYb0paRt8WuOnLm7ln+wSg3PXQbv76t69kKJti86GD3HLHFrKZDDgX57uKQ/CMUMiXePdrxrlswyhByeJ5PkaXkIZ0AX7hy6hlWZ9PJpbTJG+sxhGvxMdNuvaa2L07GMyl+cZDO7nnoeeR/iyI8oOt+/jOtj3c+KqNXDy+gof+4OpokElcbZKGmBqWZVMUygGe6QylVscAbEQoWWH7gXkuHR/CM6bGFzp1GPHqXzuLkcZj0TOGuXLAGauG+PN3vxrPGBwQWsvG1UMslCwpYMNANqYsXY0UqefFENqQMGY+teb2F9OpbROXtnM9OFlsCKzynUcPU6g4fvnCFfSmvYjFUodnUkwuFHli3wwbVvQxNtSPdQFGTEOItlBR0r5P2mtUCzvnKFRszIxVlSAJBrLKfsXXUvuRCD2ppqxbYnala8EvbqX9hBLDKZ6X4ttbdvKBv93KgXyZwazP5647n/dceTbO2fqYRhH6Ml7sti3TC2V2Hinge8LGVQP0ZZMER2PufPRcKA7jGsPttjGWzgFYQbENemXjeTx7cIIbb7+fWefR25NhLlRu+tojXLBuhMtOX4F1FiOCqESu3BgOzRa494lDlKwgzrHryAJXnbeSXDoCuVixlEKtpUrJNKk6pEZrrjs673vTpi0zpc7pbGgq3lT54y/96GlmSgEDPT7WhuRSilXLX/7bUxFFqUmPb7DO8eCuKQLr0ZvyyGXSTC1Ytu2brVl7MQgphI7AKWXnKDslcI5SYAmcUlEIHIQWSoFSDGxjcakbZP3HUTbx1ty6bwbxUzgbRsefdYhn2LYvj6qtRbtKRDNOL1SYLISkfSGMZT9pXzg4W6JiHWkvUokUiwEPH5hDY5mPoGxaNcDuySJBEKIiOKdsXNHLqsGeuHyotBtxZDrIQ8cq5kZTsS6ez5h8rShh6GLdVeMGKVXC+PWJarAIlUAJwrB2S0RdFMQ5jf8DxKAK1gnqIiGexTSI6rsW/B+yX6lFuM6BZ2D9cA8ShqB+ZGlGMNaxdiiNEQ9rw0i3FRcPfM+04CUiAZ6JdbXWQV8mxRUbl9eUm5Gaw3Lp6cN4cVDlUIJAsU7bluntoHpwXCisZjExSNdefBp/+S+7QAQfRYzBlcq87eJ10RkcJzkSy2KHezP0pAylUPFFwBgqYcjyvizZVLRJjIH5QoX7d0+DCqoOY+DsNUPsPDxLMXB4KKGzbFo1yNqh7CJw2yUd7hwXrYuJD+tC3nTBabz3tWeQP5Jnfr7C3KF5rrt0Pe+8/Eychg2Mk3OQ8T3OWz1AsRJQdkTNac5xwdhAXPQHE28UMR6eRO0sHuBLpKH2RTDG4Ncqz+3LanUM0VEJlX967DCBhTefP0ou7eFcREz4nsfdP32OLbsmOWfdEO+8bJwwdptmkTOOINy+f4ZnJgv4Ai9bPchpo704tRjxmMqXKYeRO68WKxwQOvCNNBQiAuvwPWF5f2bx/WuD+9k5LrpVqyfgez5H5hbIZQ1nru5jIOuzd3qeseFBrLOxT28MqAxw3tphxkd7MSL0pFM1h6aqZNM+IrZmmJFgFzK+xKlX3NkQC/IzKXNsl9MF+HhAllo87RR84/Hn9z3KH9+zgwOzpVouNNKf4iNXbeL333w+Ni7SV2F2Tnl43yw7D89TtIpRQ29W2LRygE2r+lFVetKGXLp5RpxSDCKBfU8qtTh10/YU3/mdZLJKVGC3TjHicet9j/HhrzxEaqCP3qFczDIZ8hb+4O8fJbSOj19zMaELY55Z+MGOQzxzpEzaNxiJEq9iQTn89CQzxQqXbxjFqU2EdlErS74c8t3HD5HL+Lz+3BVRx0Oc+1b7jdtxdVQeXLXgTDrF/qlZPnHPo2SGBsn4gjqHqmKdI2UgO9zLH3/vaZ48OIlnfIwYnjw4x9MTJfqzHikDJlZnZkTJZnweOVBg78wCRjy0iZpSIkF99fvJEkM7N6CZTrJe66KqUtp4fP2ne5iYLmE1ktAUKpZCxVIMQhbKAUEYUMyX+Oq/746DIcuOQ/N4GCrWESiEQEWVkhMCF73/E4eKTQlO/fxWR2NR4ThY1a6LPo7lNApoBrJCOu7Yn85XWL+8n/5cGusW33MjkO/xmZ4vo6qUQ4fnCcO9EpURY0t0Uh3lADalEFpCp5hYQKBxMGeAgawhl44KDA5tbG3tpkkvzoKjm9jK0US6rPqcjUSTeO0V0Uj7KAb+mWy9pZ831bXgYxMbxgizxSLv+/IDTJQsGa9eePeqvUWSOA0lQTvEnQkRd+xwYiKrU4cYE5cQ6w3movUgzmlibkd82iZbWYvWMTaQ5rZfu5x0zH61qy23H8ANbk8olC3f3j5BoWQjv6tLkIBJ9Ya2OBDVAWGsivficlQif5JEYT95Dc0tLHFT8chAii+EIZmUTzvr7tr8DBY8zzCU87AYUl7V+1Unp9QDnuZ5GvXxDhFeC8WQO9/7amyovPP/3U+u14tlr/UURxLMWcPeSDSYiUA5dAz2xA3lbb7aHGDFqeA0Igs1zktRk+CyorvuAKOJ8YWisV46RtkJw7lUTcyuSDytp84n149OhwqYqjRLmlMhIXSabKDoAvxiAe5NeYhzVMohYcrgXDNZGVtp1EJWn00p9UmVAjhj+OXbHkCcxXmQL4dRi2izS6656WgcROSRtSE6t4HD9Qhpvwvwi3DKdd2ac0p/T4aP/KeN3PajZ+npSdcwTbrgpd6p3r8rNatTVXwv0mghVUGAaegrroZM0qS3i8Y5GCrlCje/7gz6Mtma5qv5+rtp0gsgOkQ8yraCYGrJkC7imVpD7NcksqZRHxlzx4GzDWlW/S2lfsYnFZYKYpSUSaNqW2/QNkqTOgJgF6dFR7cPaQC+yl79+OkJyjbRMxy/hVMl5cFrNi4n43n14WhH9Sv1DRXx4bJ0jtd10ceLdZ2m0GTPoDYTmdqUQxtmCgFPHMwjYlpipqqcPxawvN/HOUVEW9hyXSZU/+zq4LQW2Vh3RscLJTzqlKC0dMnaSEZI/TuThQpiDD0xGZFkuowxlIKQ2WKFFf09GKn3ercU0cWkyFEB7E7ZeQE0lhxftUakWoSPGCurEDqHL8q+mRIWsBopI6OjNeqMUBepJvfPljltxBKqxlKc6sTZxNjD47iOdq0ndfA4YUXEUAgcpaCCdUpoq7lsNIZnvhDSmzL4BpwXbYTaeCsBMYbZQshkMYyn5EXnqjERwdLjG3IpFpUOO8Fy2zvIWiLYagVwvhKyULE1nbJqfQJ0NB1Pa2RF8vyuYyakTRSEaeymJRba9aYMvRmv3pa6pOl2AX6RNsoxS3LRQNHq0G+HU8U5ahNhlfp8ymQsrEJMZMQyPDHR1FkTFTn8eNxSp525nWXBx2XJyZdIy22iRyVW5OhnaocDfMo8syE5HStpddIUadf/OXoJ6FhNo52y/PYGjeNXTSyhatQmmJNnZtIFV1OgY6ZCTcdDdyD4C3LBjU3XP+tiXBKcWp78QgCTJfRZbVQf9k8urs1y0856BFXDSOJG3qttnLt/Mq22eguc04apr4riYiWdGGmYteFc48PqRKSlG9clztRFwZcmK0eLTa/5O6rUc+040hapj3Fw2nRtP5dRdEtRXSRg03jMAgmhXNQCWgVisYDOuXARyItLvE09wbGgvWpzTmtJ1SKWTGsTzzRmuEzDFgicwyd6IkzzCsMAr1rROgnn9YkHuOnOW2vZ+exzjG9YQyqdiRWQyg9/sJmJiWle9apfYM3aVVgbYIzHnt3PMz0zF1u2sHHjBrLZ3CKQ82VLGKsDRKA/m8YTrVmfiMdMocJ0sUJvxmdFX7qJs4ie01AIAgZzGdQ5jAiH5gvsnliI+okRzl7bT186g6pw5MgEe/fur4n6Nmw4jYGB/sZrO8EgnzQXHfXh+szMTHHDr9zE3d++nfHxdRw+fIQb3v4hHt62nb5cHwuFPLfd+mne8fZrAPjEJ/+UO+/6Z5YvG2ahWGTN2pX8w123csbpp+Gcw5jIbW7dO82RfIWUgVKoLO9N8+ozRvG9yOVvfX6K7QfnyKV8CgGcPprlsvGRCGGNCI/HD86zc6LAWy9YET8ZzecbW/bwX77yIMv708yVK6zoy/LND/4iF4+v4qtf/Rb//X98lpUrl1MslfB8+KPPfJT3vPsddS90goE+6Z0NIgY/nak+UoybbvoEWGHrlnvYsf27/OEnf4f33/RxHt72RGSZC2U++pGb+PGPv85PNn+D9WNr+dxnb0PERI+6ia3POeXlY4Ncdc5KfunslSyUQ3ZO5DHi8ezhOZ45OMfrNq3gLRes5qpzV7B3tsSOQ3O1J5ZGjwwooiiH8hVMPPV7IYDXX7iGRz51LY9/+npesXEFH/jKTwAoFovccMPVPHD/Xdz/k6/zsd+7mQ9/8H9x730/xvN8rD3xwy3bonXFOaW/v4/HH9vBli2P8s27b+X0DWP09+e45Zbf5Nprr+JPvnB7zaWvHVvJunVr2HjWBt7/vrfz7M690R9jEjGsRnqunlSKkVyGsZEcs6UQULYfnOeiDaOsGchhBJb3pnnl+Ag7DxcIbHQ2H54tkTawcXmOPVPFuphelf50ilWDvZwxOsifveNyDsyXqAApIwwO9bN27SrOOnOcW255Nx/56Hv4/Oe/mDjTT2WAl/gDVYVsNsO9923mla+4kOHhIYKgTBAEOOf4rd+4nm1bIwvu6Ulx8NAEhw9PsGv3c9xxx3d44xtek8hh4wdroBSCqFdpeqHE4dkCa4d6KJYriCrrhrJx8BQFUasGMhhPmF4oA8Lz03lGerOMj/YymS9TCqpPO1Nc4q45bZTUhqHFOaVYKmGt5cZffyv79h5kanoaz/MbH413Sp3Bx/EHTU5Msm7d6jgVisYkGGMYW7cS50IqlTLDI0N8/k++yJf/6g5m5ubp6cnyv7/we7UnmVUjW894/PS5WR71ZymUQwZ7UowN5TgyVyTte6Tj8mE1WfOMkPagFDgUx3Qh5OzVgwxkM/i+x8F8hfHhNJ5veH4qz/e3P0/g4HP3PMr4SC9poBRYjKmXGz3PY3R0GdlsismJKUaGhxtL3SdgcstJCLKiSDYKiBqT1N7ePvbufwZjBGuj2c7OOYrFMiKK76eYm1vgN3/jem585zUEoeX22+/k/Td/nG/e9cVEg7ghcMo5q/tZM5jFOdi2b4pt+6Y5fbSfiouGnKU8Fw1ZSTwcK53ymC2UCaxjoWIphSV8Awdni4wP99Gb9nloV54b/2oz+6eKbFo7wLduvnJxIhL/jeVyidBaenLZk0LlnIQzWDDGx/fTOOfwfR/P97DOctnlF7B588NYF5BK+QSBxRjDD3/4AMtGhjHGUCiUeNl5G3nFKy/hiisu4//+xf/k2Z0H2L//IMb4sfVHN3oo5zOSyzLal+XlY8Psmy7SkxKsCpMLkUozEs/BfCkgXwkZzqU5OFOhaA0P7plh885JZgoBR/IhAHNly+vOWcb2T1/Pp37lQlYP9nDWqqHoZko9Q4jIG8O//uhBUn6K1atWomqREzyG2JxI9xwJ2wxbtmzjK39zJ8YYtm55gnKlQiaT4oorLiPle/y33/0jQMhme3hyxzN86lN/xm/99g01a3cJ9fu/3/8IpWKZbDbT8Fki1MgLUI7MlwlU8I3PusEcD+2eoRREk96dU+7fOcmy3gwZ37BnJs8rxgd487kredN5K3nLuSsJrSVUi2+UgUyKgWyK373qHB49MMc3f7onCgABz/MQEbLZLI8/9iS/818/w7vedW0URYcnvhXihLroahA0cWSS977v9/naHd/igfsf40MffheZVBZV5dZbP8Nbrnkv//KvDzI2tooffP8BfvVtb+BdN15fs5I//OT/4c6v3U0lcGx9eAcfuuXXWbZsJCZDTBz8wJZdU+xIzxJYmC4EXHZ6lOeet3aAIwsl7n5kP6P9aeYWKojCFeev4PBcERs6xoZzGBFS0SNeGOxJsXuqQCWwTC2UUIXedIYPXnkGH/ybzVxz0Qay6TRfuv3v2bb1cRYKBZ56chfXXv8GPvCBG3EuxPO8E+8vTwiT1ULIfu99/8Zff+nrXHrpRdx883/GmIjL9bwUTz75DH9x29eYODLNG990JTf+2lvj0cAe//iP3+PhbTtiy7Occ+4mrr/+9bUyoMSam+cmF5gphVFeq47lfRlWDebi4eHRSKRnD+eZXKjQl/HZtLKPTCrFkfkC5VAZG87WGt1EhMP5EoGz7J/Ms2dyjl+95CwcykypxK3fe4wPvfHl7HriKb51z/fxvGhq7QUXnMfVV78umpLrlkiTfsZB1gkHOAocpUmrHD8xtDZVrtmxWKrNYS01ztjGSxdpqdSI6r2aiGRNY/1HXYJ/tk2f1fRoPGwtIav1lLZoNFcNjx5anRIAtygw2HhoSlWjnNzdzinOudqvJF2bcy4+g+tnrTEe9SK+1Ks+NCo7mi2oPm6jsUtBG0QBTY+wjLsTk1NsrYsm4GmLaxNjWsJ7olpcTgrAzaxOUlXx4s/2xe99dD11PWlJiutbvWfLcqQefUbHMcE7QVz0Ca0mvZh5Uq1kMZ0glVmEZ7wXjJ7Y9paOaF15wdbRhqum7jnB125OBlhyHDv9pefPXryIZqnfPZ73lKR3PAkb0z8JJll/oMVRdvpLz5+99L8rL2BTn6x18lz00f7w5oBMj27d0jRVR5t+1tAUKscAMlkdanoIfItBD4kEShOv7zaAd9epeAZ3Vxfg7uoC3F1dgLurC3AX4O46BQEW6d6RrgV3Vxfg7uoC3F1dgLurC3B3dQHuAty0uqnSKbNE5MTVg9ttEvopA2KiBl0dx1hdylIF/yUUhksVvJcEMzGEZNGkoRa15+SsqlZrkfjuFAVtkcAgITJcpP5M3I1WeDQW/I/DCuH4dEgnxFqTvZiLnrEujddxlL5cabphssRNb7nBW3xuy+tZwpCa9dFJ5elLMW3vBQHcXd0ourvabP1/nikm3WZowIgAAAAASUVORK5CYII=';

      // ── Calcular anchos mínimos para una fuente dada ────────────────────
      const calcWidths = (fs: number): { widths: number[]; total: number } => {
        const ratio = (fs / 8) * CHAR_W_RATIO;
        const widths = this.columnas.map(col => {
          const hLen = this.formatearColumna(col).length;
          const dLen = Math.min(
            this.resultados.reduce((mx, row) =>
              Math.max(mx, row[col] != null ? String(row[col]).length : 0), 0),
            MAX_CHARS
          );
          return (Math.max(hLen, dLen) + COL_PAD * 2) * ratio;
        });
        return { widths, total: widths.reduce((a, b) => a + b, 0) };
      };

      // ── Fuente óptima: reducir hasta que todas las columnas quepan ───────
      let fontSize = 8;
      let { widths: colWidths, total: totalW } = calcWidths(fontSize);
      for (let f = 7; f >= 5; f--) {
        if (totalW <= USABLE_W) break;
        ({ widths: colWidths, total: totalW } = calcWidths(f));
        fontSize = f;
      }

      // ── Si con 5pt aún no caben: comprimir proporcionalmente (forzar fit) ─
      if (totalW > USABLE_W) {
        const factor = USABLE_W / totalW;
        colWidths    = colWidths.map(w => w * factor);
        totalW       = USABLE_W;
      }

      // ── Distribuir espacio sobrante proporcionalmente ─────────────────────
      if (totalW < USABLE_W) {
        const extra = USABLE_W - totalW;
        colWidths   = colWidths.map(w => w + (w / totalW) * extra);
      }

      const rowH = Math.max(5.5 * (fontSize / 8), 4.2);

      // ── Crear documento ──────────────────────────────────────────────────
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // ── HELPER: cabecera en la página actual ─────────────────────────────
      const dibujarCabecera = (): void => {
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
        doc.setFillColor(79, 70, 229);
        doc.rect(0, HEADER_H - 3, PAGE_W, 3, 'F');

        if (logoBase64) {
          const lH = 18, lW = 18;
          doc.addImage(logoBase64, 'PNG', MARGIN, (HEADER_H - lH) / 2, lW, lH);
        }

        const titleX = logoBase64 ? MARGIN + 21 : MARGIN;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(titulo, titleX, HEADER_H / 2 + 2);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const fechaStr = `Generado: ${new Date().toLocaleDateString('es-EC')}`;
        if (nombreAdmin) {
          doc.text(nombreAdmin, PAGE_W - MARGIN, HEADER_H / 2 - 1, { align: 'right' });
          doc.text(fechaStr,    PAGE_W - MARGIN, HEADER_H / 2 + 5, { align: 'right' });
        } else {
          doc.text(fechaStr, PAGE_W - MARGIN, HEADER_H / 2 + 2, { align: 'right' });
        }
      };

      // ── HELPER: fila de encabezados de columna ────────────────────────────
      const dibujarHeaderColumnas = (yPos: number): void => {
        doc.setFillColor(220, 222, 255);
        doc.rect(MARGIN, yPos - rowH * 0.82, USABLE_W, rowH, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(55, 65, 81);
        let x = MARGIN;
        this.columnas.forEach((col, i) => {
          const label = this.formatearColumna(col);
          const maxC  = Math.floor((colWidths[i] - COL_PAD * 2) / ((fontSize / 8) * CHAR_W_RATIO));
          const txt   = label.length > maxC ? label.substring(0, Math.max(maxC - 1, 1)) + '…' : label;
          doc.text(txt, x + COL_PAD, yPos);
          x += colWidths[i];
        });
      };

      // ── HELPER: pie de página base (línea + título izq) ───────────────────
      // Los números "X de N" se agregan al final cuando se conoce el total
      const dibujarFooterBase = (): void => {
        const lineY = PAGE_H - FOOTER_H + 1;
        doc.setDrawColor(180, 180, 210);
        doc.setLineWidth(0.25);
        doc.line(MARGIN, lineY, PAGE_W - MARGIN, lineY);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 170);
        doc.setFont('helvetica', 'normal');
        doc.text(titulo, MARGIN, PAGE_H - 2.5);
      };

      // ── Imprimir tabla (TODAS las columnas en cada fila) ──────────────────
      dibujarCabecera();
      let y = HEADER_H + rowH + 3;
      dibujarHeaderColumnas(y);
      y += rowH;

      doc.setFont('helvetica', 'normal');
      this.resultados.forEach((fila, idx) => {
        const maxY = PAGE_H - FOOTER_H - rowH - 1;
        if (y > maxY) {
          dibujarFooterBase();
          doc.addPage();
          dibujarCabecera();
          y = HEADER_H + rowH + 3;
          dibujarHeaderColumnas(y);
          y += rowH;
          doc.setFont('helvetica', 'normal');
        }

        if (idx % 2 === 0) {
          doc.setFillColor(247, 248, 255);
          doc.rect(MARGIN, y - rowH * 0.82, USABLE_W, rowH, 'F');
        }
        doc.setFontSize(fontSize);
        doc.setTextColor(55, 65, 81);

        let x = MARGIN;
        this.columnas.forEach((col, i) => {
          const raw  = fila[col] != null ? String(fila[col]) : '—';
          const maxC = Math.floor((colWidths[i] - COL_PAD * 2) / ((fontSize / 8) * CHAR_W_RATIO));
          const txt  = raw.length > maxC ? raw.substring(0, Math.max(maxC - 1, 1)) + '…' : raw;
          doc.text(txt, x + COL_PAD, y);
          x += colWidths[i];
        });
        y += rowH;
      });
      dibujarFooterBase();

      // ── Página de estadísticas ─────────────────────────────────────────────
      if (this.graficos.length > 0) {
        // Si los gráficos no están visibles, mostrarlos temporalmente
        const eraTabla = this.mostrandoResultados && !this.mostrandoGrafico;
        if (eraTabla) {
          this.mostrandoGrafico    = true;
          this.mostrandoResultados = false;
          this.cdr.detectChanges();
          await new Promise(r => setTimeout(r, 150));
          this.crearCharts();
          await new Promise(r => setTimeout(r, 450));
        }

        const chartEl = document.getElementById('charts-export-area');
        if (chartEl) {
          // ── Capturar gráficos con alta resolución ─────────────────────────
          const canvas   = await html2canvas(chartEl, { scale: 1.8, backgroundColor: '#f8fafc' });
          const imgData  = canvas.toDataURL('image/png');

          // ── Proporciones reales del canvas — NUNCA se distorsiona ─────────
          const natRatio = canvas.height / canvas.width;
          const imgW     = USABLE_W;
          const imgH     = imgW * natRatio;            // alto proporcional exacto

          // Espacio disponible en la página de estadísticas (bajo el título)
          const titleGap = 12;
          const pageSlot = PAGE_H - HEADER_H - FOOTER_H - titleGap - 4;

          // ── Página de estadísticas con cabecera y título ──────────────────
          doc.addPage();
          dibujarCabecera();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(99, 102, 241);
          doc.text('Estadísticas del Reporte', MARGIN, HEADER_H + 7);

          if (imgH <= pageSlot) {
            // ✅ Cabe: insertar a tamaño real proporcional
            doc.addImage(imgData, 'PNG', MARGIN, HEADER_H + titleGap, imgW, imgH);

          } else {
            // ✅ No cabe en alto: escalar reduciendo solo el alto, manteniendo ratio
            const imgHFit = pageSlot;
            const imgWFit = imgHFit / natRatio;

            if (imgWFit <= USABLE_W) {
              // Cabe reducida — centrar horizontalmente
              const offsetX = MARGIN + (USABLE_W - imgWFit) / 2;
              doc.addImage(imgData, 'PNG', offsetX, HEADER_H + titleGap, imgWFit, imgHFit);
            } else {
              // Caso extremo: imagen muy alta y muy ancha → página dedicada sin cabecera
              doc.addPage();
              const fH = PAGE_H - MARGIN * 2;
              const fW = fH / natRatio;
              const fX = MARGIN + (USABLE_W - Math.min(fW, USABLE_W)) / 2;
              const finalW = Math.min(fW, USABLE_W);
              const finalH = finalW * natRatio;
              doc.addImage(imgData, 'PNG', fX, MARGIN, finalW, finalH);
            }
          }
          dibujarFooterBase();
        }

        // Restaurar vista tabla si corresponde
        if (eraTabla) {
          this.destruirCharts();
          this.mostrandoGrafico    = false;
          this.mostrandoResultados = true;
          this.cdr.detectChanges();
        }
      }

      // ── Agregar "Página X de N" en cada footer ────────────────────────────
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFillColor(255, 255, 255);
        doc.rect(PAGE_W - 42, PAGE_H - FOOTER_H, 42, FOOTER_H, 'F');
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 170);
        doc.setFont('helvetica', 'normal');
        doc.text(`Página ${i} de ${totalPaginas}`, PAGE_W - MARGIN, PAGE_H - 2.5, { align: 'right' });
      }

      doc.save(`${titulo.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      this.mostrarExito('PDF exportado correctamente.');

    } catch (e) {
      this.mostrarError('Error al exportar PDF. Instale: npm install jspdf html2canvas');
      console.error(e);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTAR EXCEL
  // ═══════════════════════════════════════════════════════════════════════════
  async exportarExcel(): Promise<void> {
    if (this.resultados.length === 0) await this.ejecutarVistaPreviaAsync();
    if (this.resultados.length === 0) { this.mostrarError('No hay datos para exportar.'); return; }

    try {
      const wb     = XLSX.utils.book_new();
      const titulo = this.tipoReporte === 'ofertas' ? 'Ofertas' : 'Postulaciones';

      const wsData    = XLSX.utils.json_to_sheet(this.resultados);
      wsData['!cols'] = this.columnas.map(col => ({
        wch: Math.max(col.length, ...this.resultados.map(r => String(r[col] ?? '').length))
      }));
      XLSX.utils.book_append_sheet(wb, wsData, titulo);

      if (this.graficos.length > 0) {
        const statsRows: (string | number)[][] = [['Estadísticas del Reporte'], []];
        this.graficos.forEach(g => {
          statsRows.push([g.titulo]);
          statsRows.push(['Categoría', 'Cantidad', 'Porcentaje']);
          g.datos.forEach(d => statsRows.push([d.etiqueta, d.cantidad, `${d.porcentaje.toFixed(1)}%`]));
          statsRows.push([]);
        });
        const wsStats    = XLSX.utils.aoa_to_sheet(statsRows);
        wsStats['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
      }

      XLSX.writeFile(wb, `${titulo}_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.mostrarExito('Excel exportado correctamente.');
    } catch (e) {
      this.mostrarError('Error al exportar Excel. Verifique: npm install xlsx');
      console.error(e);
    }
  }

  private ejecutarVistaPreviaAsync(): Promise<void> {
    return new Promise(resolve => {
      this.vistaPrevia();
      const check = setInterval(() => { if (!this.cargando) { clearInterval(check); resolve(); } }, 200);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) { this.paginaActual = p; this.cdr.detectChanges(); }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECCIÓN DE COMBOBOXES
  // ═══════════════════════════════════════════════════════════════════════════
  selectCiudad(c: CiudadDTO): void {
    this.ciudadSeleccionada            = c;
    this.ciudadSearch                  = `${c.nombreCiudad} — ${c.nombreProvincia}`;
    this.ciudadOpen                    = false;
    this.filtrosOfertas.idCiudad       = c.idCiudad;
    this.filtrosPostulaciones.idCiudad = c.idCiudad;
  }
  limpiarCiudad(): void {
    this.ciudadSeleccionada            = null;
    this.ciudadSearch                  = 'Todos';
    this.ciudadOpen                    = false;
    this.filtrosOfertas.idCiudad       = null;
    this.filtrosPostulaciones.idCiudad = null;
  }

  selectCategoria(c: CategoriaDTO): void {
    this.categoriaSeleccionada            = c;
    this.categoriaSearch                  = c.nombreCategoria;
    this.categoriaOpen                    = false;
    this.filtrosOfertas.idCategoria       = c.idCategoria;
    this.filtrosPostulaciones.idCategoria = c.idCategoria;
  }
  limpiarCategoria(): void {
    this.categoriaSeleccionada            = null;
    this.categoriaSearch                  = 'Todos';
    this.categoriaOpen                    = false;
    this.filtrosOfertas.idCategoria       = null;
    this.filtrosPostulaciones.idCategoria = null;
  }

  selectModalidad(m: ModalidadDTO): void {
    this.modalidadSeleccionada            = m;
    this.modalidadSearch                  = m.nombreModalidad;
    this.modalidadOpen                    = false;
    this.filtrosOfertas.idModalidad       = m.idModalidad;
    this.filtrosPostulaciones.idModalidad = m.idModalidad;
  }
  limpiarModalidad(): void {
    this.modalidadSeleccionada            = null;
    this.modalidadSearch                  = 'Todos';
    this.modalidadOpen                    = false;
    this.filtrosOfertas.idModalidad       = null;
    this.filtrosPostulaciones.idModalidad = null;
  }

  selectJornada(j: JornadaDTO): void {
    this.jornadaSeleccionada      = j;
    this.jornadaSearch            = j.nombreJornada;
    this.jornadaOpen              = false;
    this.filtrosOfertas.idJornada = j.idJornada;
  }
  limpiarJornada(): void {
    this.jornadaSeleccionada      = null;
    this.jornadaSearch            = 'Todos';
    this.jornadaOpen              = false;
    this.filtrosOfertas.idJornada = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CERRAR DROPDOWNS AL HACER CLIC FUERA
  // ═══════════════════════════════════════════════════════════════════════════
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      if (!this.ciudadSeleccionada    && !this.ciudadSearch)    this.ciudadSearch    = 'Todos';
      if (!this.categoriaSeleccionada && !this.categoriaSearch) this.categoriaSearch = 'Todos';
      if (!this.modalidadSeleccionada && !this.modalidadSearch) this.modalidadSearch = 'Todos';
      if (!this.jornadaSeleccionada   && !this.jornadaSearch)   this.jornadaSearch   = 'Todos';
      this.ciudadOpen = this.categoriaOpen = this.modalidadOpen = this.jornadaOpen = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES DE FORMATO
  // ═══════════════════════════════════════════════════════════════════════════
  formatearColumna(col: string): string {
    return col.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  }
  formatearValor(val: any): string {
    if (val == null) return '—';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) return new Date(val).toLocaleDateString('es-EC');
    if (typeof val === 'number' && val > 100) return `$${val.toFixed(2)}`;
    return String(val);
  }
  mostrarExito(msg: string): void {
    this.mensajeExito = msg; this.mensajeError = '';
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
  }
  mostrarError(msg: string): void {
    this.mensajeError = msg; this.mensajeExito = '';
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 6000);
  }
}
