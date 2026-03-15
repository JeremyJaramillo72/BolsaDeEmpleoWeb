import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';

// ✅ Registrar Chart.js una sola vez
Chart.register(...registerables);

// ─── Interfaces de Catálogos ─────────────────────────────────────────────────
interface CategoriaDTO { idCategoria: number; nombreCategoria: string; }
interface ModalidadDTO { idModalidad: number; nombreModalidad: string; }
interface JornadaDTO   { idJornada:   number; nombreJornada:   string; }
interface CiudadDTO    { idCiudad:    number; nombreCiudad:    string; nombreProvincia: string; }

interface GraficoData {
  titulo: string;
  datos: { etiqueta: string; cantidad: number; porcentaje: number; color: string }[];
}

interface TopOpcion { label: string; valor: number | null; }

@Component({
  selector: 'app-reporte-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './Reporte-Empresa.html',
  styleUrls: ['./Reporte-Empresa.css']
})
export class ReporteEmpresaComponent implements OnInit, OnDestroy {

  private readonly API_BASE        = 'http://localhost:8080/api';
  private readonly API_REPORTE      = `${this.API_BASE}/reportes-empresa/ofertas`;
  private readonly API_CIUDADES     = `${this.API_BASE}/ciudades`;
  private readonly API_CATEGORIAS   = `${this.API_BASE}/categorias`;
  private readonly API_MODALIDADES  = `${this.API_BASE}/modalidades`;
  private readonly API_JORNADAS     = `${this.API_BASE}/jornadas`;
  // Endpoint que devuelve la URL de la última imagen del usuario
  private readonly API_ULTIMA_IMAGEN = `${this.API_BASE}/usuarios-bd/empresa`;

  idEmpresa: number | null = null;

  // URL de la imagen de perfil de la empresa (última en fecha de usuario_imagen)
  imagenPerfilUrl: string | null = null;

  resultados:  any[]         = [];
  columnas:    string[]      = [];
  graficos:    GraficoData[] = [];

  cargando            = false;
  mostrandoResultados = false;
  mostrandoGrafico    = false;

  mensajeExito = '';
  mensajeError = '';

  paginaActual   = 1;
  itemsPorPagina = 10;

  ciudades:    CiudadDTO[]    = [];
  categorias:  CategoriaDTO[] = [];
  modalidades: ModalidadDTO[] = [];
  jornadas:    JornadaDTO[]   = [];

  // Estados reales según la BD (minúsculas igual que reporte admin)
  estadosOferta = ['aprobado', 'pendiente', 'rechazada', 'cancelada'];

  opcionesTop: TopOpcion[] = [
    { label: 'Todas',  valor: null },
    { label: 'Top 5',  valor: 5    },
    { label: 'Top 10', valor: 10   },
    { label: 'Top 15', valor: 15   },
    { label: 'Top 20', valor: 20   }
  ];

  filtros = {
    top:          null as number | null,
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

  // ─── Comboboxes con "Todos" por defecto ──────────────────────────────────
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

  erroresFiltros: string[] = [];

  // ✅ Instancias Chart.js — se destruyen antes de recrear
  private chartsInstances: Chart[] = [];

  // ─── Getters: comboboxes filtrados ───────────────────────────────────────
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

  get resultadosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.resultados.slice(inicio, inicio + this.itemsPorPagina);
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.resultados.length / this.itemsPorPagina));
  }
  get hoyISO(): string { return new Date().toISOString().split('T')[0]; }
  get labelTopSeleccionado(): string {
    const op = this.opcionesTop.find(o => o.valor === this.filtros.top);
    return op ? op.label : 'Todas';
  }

  // ✅ Getters para tarjetas de resumen en vista de estadísticas
  get totalPostulaciones(): number {
    return this.resultados.reduce((s, r) => s + (Number(r['totalPostulaciones']) || 0), 0);
  }
  get totalAceptadas(): number {
    return this.resultados.reduce((s, r) => s + (Number(r['postulacionesAceptadas']) || 0), 0);
  }

  get totalCanceladas(): number {
    return this.resultados.reduce((s, r) => s + (Number(r['postulacionesCanceladas']) || 0), 0);
  }

  constructor(
    private http:   HttpClient,
    private cdr:    ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const idEmpresaStr = localStorage.getItem('idEmpresa');
    this.idEmpresa     = idEmpresaStr ? Number(idEmpresaStr) : null;
    this.cargarCatalogos();
    this.cargarImagenPerfil();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

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
  // CARGA DE IMAGEN DE PERFIL
  // ═══════════════════════════════════════════════════════════════════════════
  cargarImagenPerfil(): void {
    if (!this.idEmpresa) return;

    const url = `${this.API_ULTIMA_IMAGEN}/${this.idEmpresa}/ultima-imagen`;
    this.http.get<{ urlImagen: string | null }>(url).subscribe({
      next: res => {
        this.imagenPerfilUrl = (res?.urlImagen && res.urlImagen.trim() !== '')
          ? res.urlImagen : null;
      },
      error: () => { this.imagenPerfilUrl = null; }
    });
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
    this.filtros = {
      top: null, idCiudad: null, idCategoria: null, idModalidad: null,
      idJornada: null, fechaInicio: '', fechaFin: '',
      salarioMin: null, salarioMax: null, estadoOferta: ''
    };
    this.ciudadSeleccionada    = null; this.ciudadSearch    = 'Todos'; this.ciudadOpen    = false;
    this.categoriaSeleccionada = null; this.categoriaSearch = 'Todos'; this.categoriaOpen = false;
    this.modalidadSeleccionada = null; this.modalidadSearch = 'Todos'; this.modalidadOpen = false;
    this.jornadaSeleccionada   = null; this.jornadaSearch   = 'Todos'; this.jornadaOpen   = false;
    this.cdr.detectChanges();
  }

  private validarFiltros(): boolean {
    this.erroresFiltros = [];
    if (!this.idEmpresa)
      this.erroresFiltros.push('No se pudo identificar la empresa. Por favor recargue la página.');
    if (this.filtros.fechaInicio && this.filtros.fechaFin &&
      new Date(this.filtros.fechaFin) < new Date(this.filtros.fechaInicio))
      this.erroresFiltros.push('La fecha fin no puede ser anterior a la fecha inicio.');
    if (this.filtros.fechaInicio && this.filtros.fechaInicio > this.hoyISO)
      this.erroresFiltros.push('La fecha inicio no puede ser una fecha futura.');
    if (this.filtros.fechaFin && this.filtros.fechaFin > this.hoyISO)
      this.erroresFiltros.push('La fecha fin no puede ser una fecha futura.');
    if (this.filtros.salarioMin !== null && this.filtros.salarioMin < 0)
      this.erroresFiltros.push('El salario mínimo no puede ser negativo.');
    if (this.filtros.salarioMax !== null && this.filtros.salarioMax < 0)
      this.erroresFiltros.push('El salario máximo no puede ser negativo.');
    if (this.filtros.salarioMin !== null && this.filtros.salarioMax !== null &&
      this.filtros.salarioMax < this.filtros.salarioMin)
      this.erroresFiltros.push('El salario máximo no puede ser menor al salario mínimo.');
    return this.erroresFiltros.length === 0;
  }

  vistaPrevia(): void {
    if (!this.validarFiltros()) return;
    this.destruirCharts();
    this.cargando            = true;
    this.mostrandoResultados = false;
    this.mostrandoGrafico    = false;
    this.cdr.detectChanges();

    let params = new HttpParams().set('idEmpresa', this.idEmpresa!.toString());
    Object.keys(this.filtros).forEach(key => {
      const val = (this.filtros as any)[key];
      if (val !== null && val !== undefined && val !== '')
        params = params.set(key, val.toString());
    });

    this.http.get<any[]>(this.API_REPORTE, { params }).subscribe({
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
    setTimeout(() => this.crearCharts(), 100);
  }

  verTabla(): void {
    this.destruirCharts();
    this.mostrandoGrafico    = false;
    this.mostrandoResultados = true;
    this.cdr.detectChanges();
  }

  destruirCharts(): void {
    this.chartsInstances.forEach(c => c.destroy());
    this.chartsInstances = [];
  }

  crearCharts(): void {
    this.destruirCharts();

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

    Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', sans-serif";

    this.graficos.forEach((grafico, index) => {
      const canvas = document.getElementById(`chart-${index}`) as HTMLCanvasElement;
      if (!canvas) {
        console.warn(`Canvas chart-${index} no encontrado en el DOM`);
        return;
      }

      const labels = grafico.datos.map(d => d.etiqueta);
      const values = grafico.datos.map(d => d.cantidad);
      const solid  = labels.map((_, i) => SOLID[i % SOLID.length]);
      const bg     = labels.map((_, i) => ALPHA(SOLID[i % SOLID.length], 0.75));
      const total  = values.reduce((a, b) => a + b, 0);

      let chart: Chart;

      if (index === 0) {
        // ── DOUGHNUT: Estado de Postulaciones ─────────────────────────────
        chart = new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{ data: values, backgroundColor: bg, borderColor: solid,
              borderWidth: 2, hoverOffset: 12, hoverBorderWidth: 3 }]
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '62%',
            animation: { animateRotate: true, duration: 900, easing: 'easeInOutQuart' },
            plugins: {
              legend: {
                position: 'right',
                labels: { font: { size: 12, weight: 500 }, padding: 18,
                  usePointStyle: true, pointStyleWidth: 12, color: '#374151' }
              },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 12 },
                padding: 12, cornerRadius: 8,
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

      } else if (index === 1) {
        // ── BARRAS HORIZONTALES: Ofertas con más Postulaciones ────────────
        chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{ label: grafico.titulo, data: values,
              backgroundColor: bg, borderColor: solid, borderWidth: 2,
              borderRadius: 6, borderSkipped: false }]
          },
          options: {
            indexAxis: 'y' as const,
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 12 },
                padding: 12, cornerRadius: 8,
                callbacks: { label: (ctx: any) => `  Postulaciones: ${ctx.formattedValue}` }
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
                  font: { size: 11 }, color: '#374151',
                  callback: (val: any, i: number) => {
                    const lbl = labels[i] ?? '';
                    return lbl.length > 22 ? lbl.substring(0, 20) + '…' : lbl;
                  }
                }
              }
            }
          }
        });

      } else {
        // ── BARRAS VERTICALES: Ofertas por Categoría ──────────────────────
        chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{ label: grafico.titulo, data: values,
              backgroundColor: bg, borderColor: solid, borderWidth: 2,
              borderRadius: 10, borderSkipped: false }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(17,24,39,0.92)',
                titleFont: { size: 13, weight: 'bold' }, bodyFont: { size: 12 },
                padding: 12, cornerRadius: 8,
                callbacks: { label: (ctx: any) => `  Ofertas: ${ctx.formattedValue}` }
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
                  font: { size: 11 }, color: '#374151', maxRotation: 30,
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

  private generarGraficos(data: any[]): void {
    this.graficos = [];

    const SOLID = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
    ];

    // ── Gráfico 0: Estado Postulaciones (Doughnut) ────────────────────────
    const totalPend = data.reduce((s, r) => s + (Number(r['postulacionesPendientes'])  || 0), 0);
    const totalAcep = data.reduce((s, r) => s + (Number(r['postulacionesAceptadas'])   || 0), 0);
    const totalRech = data.reduce((s, r) => s + (Number(r['postulacionesRechazadas'])  || 0), 0);
    const totalCanc = data.reduce((s, r) => s + (Number(r['postulacionesCanceladas'])  || 0), 0);
    this.graficos.push({
      titulo: 'Estado de Postulaciones',
      datos: [
        { etiqueta: 'Pendientes', cantidad: totalPend, porcentaje: 100, color: SOLID[5] },
        { etiqueta: 'Aceptadas',  cantidad: totalAcep, porcentaje: 100, color: SOLID[6] },
        { etiqueta: 'Rechazadas', cantidad: totalRech, porcentaje: 100, color: SOLID[3] },
        { etiqueta: 'Canceladas', cantidad: totalCanc, porcentaje: 100, color: '#94a3b8' }
      ].filter(d => d.cantidad > 0)
    });

    // ── Gráfico 1: Top 10 Ofertas con más Postulaciones (Barras Horiz.) ───
    const topPost = [...data]
      .sort((a, b) => (Number(b.totalPostulaciones) || 0) - (Number(a.totalPostulaciones) || 0))
      .slice(0, 10);
    const maxPost = Math.max(...topPost.map(r => Number(r.totalPostulaciones) || 0)) || 1;
    this.graficos.push({
      titulo: 'Ofertas con más Postulaciones',
      datos: topPost.map((row, i) => ({
        etiqueta:   String(row['titulo'] || 'Sin título').substring(0, 30),
        cantidad:   Number(row['totalPostulaciones']) || 0,
        porcentaje: ((Number(row['totalPostulaciones']) || 0) / maxPost) * 100,
        color:      SOLID[i % SOLID.length]
      }))
    });

    // ── Gráfico 2: Ofertas por Categoría (Barras Vert.) ───────────────────
    const countsCat: Record<string, number> = {};
    data.forEach(row => {
      const val = row['nombreCategoria'] || 'No definido';
      countsCat[val] = (countsCat[val] || 0) + 1;
    });
    const maxCat = Math.max(...Object.values(countsCat)) || 1;
    this.graficos.push({
      titulo: 'Ofertas por Categoría',
      datos: Object.keys(countsCat)
        .map((key, i) => ({
          etiqueta:   key,
          cantidad:   countsCat[key],
          porcentaje: (countsCat[key] / maxCat) * 100,
          color:      SOLID[i % SOLID.length]
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)
    });
  }

  // EXPORTAR PDF
  crearChartsParaPDF(): void {
    this.destruirCharts();

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

    this.graficos.forEach((grafico, index) => {
      const canvas = document.getElementById(`chart-${index}`) as HTMLCanvasElement;
      if (!canvas) return;

      const labels = grafico.datos.map(d => d.etiqueta);
      const values = grafico.datos.map(d => d.cantidad);
      const solid  = labels.map((_, i) => SOLID[i % SOLID.length]);
      const bg     = labels.map((_, i) => ALPHA(SOLID[i % SOLID.length], 0.75));
      const total  = values.reduce((a, b) => a + b, 0);

      const NO_ANIM = { animation: { duration: 0 } };

      let chart: Chart;

      if (index === 0) {
        chart = new Chart(canvas, {
          type: 'doughnut',
          data: { labels, datasets: [{ data: values, backgroundColor: bg, borderColor: solid, borderWidth: 2 }] },
          options: {
            ...NO_ANIM,
            responsive: true, maintainAspectRatio: false, cutout: '62%',
            plugins: {
              legend: { position: 'right', labels: { font: { size: 11, weight: 500 }, padding: 14, usePointStyle: true, color: '#374151' } },
              tooltip: { enabled: false }
            }
          }
        });
      } else if (index === 1) {
        chart = new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: [{ data: values, backgroundColor: bg, borderColor: solid, borderWidth: 1.5, borderRadius: 4 }] },
          options: {
            ...NO_ANIM,
            indexAxis: 'y' as const,
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { beginAtZero: true }, y: { ticks: { font: { size: 10 } } } }
          }
        });
      } else {
        chart = new Chart(canvas, {
          type: 'bar',
          data: { labels, datasets: [{ data: values, backgroundColor: bg, borderColor: solid, borderWidth: 1.5, borderRadius: 4 }] },
          options: {
            ...NO_ANIM,
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { ticks: { font: { size: 10 }, maxRotation: 35 } }, y: { beginAtZero: true } }
          }
        });
      }
      this.chartsInstances.push(chart);
    });
  }

  async exportarPDF(): Promise<void> {
    if (this.resultados.length === 0) await this.ejecutarVistaPreviaAsync();
    if (this.resultados.length === 0) { this.mostrarError('No hay datos para exportar.'); return; }

    try {
      const jsPDFModule = await import('jspdf');
      const html2canvas  = (await import('html2canvas')).default;
      const { jsPDF }    = jsPDFModule;

      const PAGE_W       = 297;
      const PAGE_H       = 210;
      const MARGIN       = 6;
      const USABLE_W     = PAGE_W - MARGIN * 2;   // 285 mm
      const HEADER_H     = 26;
      const FOOTER_H     = 8;
      const COL_PAD      = 1.5;
      const MAX_CHARS    = 32;
      const CHAR_W_RATIO = 1.75;

      const titulo = 'Reporte de Ofertas Laborales — Empresa';

      const nombreUsuario =
        localStorage.getItem('nombre')        ||
        localStorage.getItem('nombreUsuario') ||
        localStorage.getItem('username')      ||
        localStorage.getItem('user')          || '';

      const cargarLogoDesdeUrl = (url: string): Promise<string | null> =>
        new Promise(resolve => {
          const img    = new Image();
          img.crossOrigin = 'anonymous';
          img.onload  = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width  = img.naturalWidth  || 200;
              canvas.height = img.naturalHeight || 200;
              const ctx = canvas.getContext('2d');
              if (!ctx) { resolve(null); return; }
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));   // siempre PNG → addImage('PNG')
            } catch { resolve(null); }
          };
          img.onerror = () => resolve(null);
          // Cache-bust para evitar respuestas 304 que bloquean crossOrigin
          img.src = url.includes('?') ? url + '&_cb=' + Date.now()
            : url + '?_cb=' + Date.now();
        });

      if (!this.imagenPerfilUrl && this.idEmpresa) {
        await new Promise<void>(resolve => {
          const urlFallback = `${this.API_ULTIMA_IMAGEN}/${this.idEmpresa}/ultima-imagen`;
          this.http.get<{ urlImagen: string | null }>(urlFallback).subscribe({
            next:  res => {
              this.imagenPerfilUrl = (res?.urlImagen && res.urlImagen.trim() !== '')
                ? res.urlImagen : null;
              resolve();
            },
            error: () => resolve()
          });
        });
      }

      const logoBase64 = this.imagenPerfilUrl
        ? await cargarLogoDesdeUrl(this.imagenPerfilUrl)
        : null;

      // ── Calcular anchos mínimos ────────────────────────────────────────────
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

      let fontSize = 8;
      let { widths: colWidths, total: totalW } = calcWidths(fontSize);
      for (let f = 7; f >= 5; f--) {
        if (totalW <= USABLE_W) break;
        ({ widths: colWidths, total: totalW } = calcWidths(f));
        fontSize = f;
      }
      if (totalW > USABLE_W) {
        const factor = USABLE_W / totalW;
        colWidths = colWidths.map(w => w * factor);
        totalW    = USABLE_W;
      }
      if (totalW < USABLE_W) {
        const extra = USABLE_W - totalW;
        colWidths   = colWidths.map(w => w + (w / totalW) * extra);
      }

      const rowH = Math.max(5.5 * (fontSize / 8), 4.2);
      const doc  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // ── HELPER: cabecera ──────────────────────────────────────────────────
      const dibujarCabecera = (): void => {
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
        doc.setFillColor(79, 70, 229);
        doc.rect(0, HEADER_H - 3, PAGE_W, 3, 'F');

        if (logoBase64) {
          const lH = 18, lW = 18;
          // canvas.toDataURL siempre produce PNG — sin necesidad de detectar formato
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
        if (nombreUsuario) {
          doc.text(nombreUsuario, PAGE_W - MARGIN, HEADER_H / 2 - 1, { align: 'right' });
          doc.text(fechaStr,      PAGE_W - MARGIN, HEADER_H / 2 + 5, { align: 'right' });
        } else {
          doc.text(fechaStr, PAGE_W - MARGIN, HEADER_H / 2 + 2, { align: 'right' });
        }
      };

      // ── HELPER: encabezados de columna ────────────────────────────────────
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

      // ── HELPER: pie de página base ────────────────────────────────────────
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

      // ── Tabla: TODAS las columnas ─────────────────────────────────────────
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

      // ── Página de estadísticas ────────────────────────────────────────────
      if (this.graficos.length > 0) {
        const eraTabla = this.mostrandoResultados && !this.mostrandoGrafico;
        if (eraTabla) {
          this.mostrandoGrafico    = true;
          this.mostrandoResultados = false;
          this.cdr.detectChanges();
          await new Promise(r => setTimeout(r, 150));
        }
        // ✅ Siempre destruir y recrear los charts con animaciones DESACTIVADAS
        // para que html2canvas capture el gráfico completo sin cortes
        this.destruirCharts();
        this.cdr.detectChanges();
        await new Promise(r => setTimeout(r, 80));
        this.crearChartsParaPDF();         // versión sin animación
        await new Promise(r => setTimeout(r, 300));

        const chartEl = document.getElementById('charts-export-area');
        if (chartEl) {
          const canvas   = await html2canvas(chartEl, { scale: 1.8, backgroundColor: '#f8fafc' });
          const imgData  = canvas.toDataURL('image/png');
          const natRatio = canvas.height / canvas.width;
          const imgW     = USABLE_W;
          const imgH     = imgW * natRatio;
          const titleGap = 12;
          const pageSlot = PAGE_H - HEADER_H - FOOTER_H - titleGap - 4;

          doc.addPage();
          dibujarCabecera();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(99, 102, 241);
          doc.text('Estadísticas del Reporte', MARGIN, HEADER_H + 7);

          if (imgH <= pageSlot) {
            doc.addImage(imgData, 'PNG', MARGIN, HEADER_H + titleGap, imgW, imgH);
          } else {
            const imgHFit = pageSlot;
            const imgWFit = imgHFit / natRatio;
            if (imgWFit <= USABLE_W) {
              const offsetX = MARGIN + (USABLE_W - imgWFit) / 2;
              doc.addImage(imgData, 'PNG', offsetX, HEADER_H + titleGap, imgWFit, imgHFit);
            } else {
              doc.addPage();
              const fH     = PAGE_H - MARGIN * 2;
              const fW     = Math.min(fH / natRatio, USABLE_W);
              const finalH = fW * natRatio;
              const fX     = MARGIN + (USABLE_W - fW) / 2;
              doc.addImage(imgData, 'PNG', fX, MARGIN, fW, finalH);
            }
          }
          dibujarFooterBase();
        }

        if (eraTabla) {
          // Volver a vista tabla
          this.destruirCharts();
          this.mostrandoGrafico    = false;
          this.mostrandoResultados = true;
          this.cdr.detectChanges();
        } else {
          // ✅ Estaba en vista gráfica — recrear charts con animación normal
          this.destruirCharts();
          this.cdr.detectChanges();
          await new Promise(r => setTimeout(r, 60));
          this.crearCharts();
        }
      }

      // ── Numerar páginas ───────────────────────────────────────────────────
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

      doc.save(`Reporte_Ofertas_Empresa_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const wsData = XLSX.utils.json_to_sheet(this.resultados);
      wsData['!cols'] = this.columnas.map(col => ({
        wch: Math.max(col.length, ...this.resultados.map(r => String(r[col] ?? '').length))
      }));
      XLSX.utils.book_append_sheet(wb, wsData, 'Ofertas');
      if (this.graficos.length > 0) {
        const statsRows: (string | number)[][] = [['Estadísticas del Reporte'], []];
        this.graficos.forEach(g => {
          statsRows.push([g.titulo]);
          statsRows.push(['Descripción', 'Cantidad', 'Porcentaje']);
          g.datos.forEach(d => statsRows.push([d.etiqueta, d.cantidad, `${d.porcentaje.toFixed(1)}%`]));
          statsRows.push([]);
        });
        const wsStats    = XLSX.utils.aoa_to_sheet(statsRows);
        wsStats['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
      }
      XLSX.writeFile(wb, `Reporte_Ofertas_Empresa_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) { this.paginaActual = p; this.cdr.detectChanges(); }
  }

  selectCiudad(c: CiudadDTO): void {
    this.ciudadSeleccionada = c;
    this.ciudadSearch       = `${c.nombreCiudad} — ${c.nombreProvincia}`;
    this.ciudadOpen         = false;
    this.filtros.idCiudad   = c.idCiudad;
  }
  limpiarCiudad(): void {
    this.ciudadSeleccionada = null;
    this.ciudadSearch       = 'Todos';
    this.ciudadOpen         = false;
    this.filtros.idCiudad   = null;
  }

  selectCategoria(c: CategoriaDTO): void {
    this.categoriaSeleccionada = c;
    this.categoriaSearch       = c.nombreCategoria;
    this.categoriaOpen         = false;
    this.filtros.idCategoria   = c.idCategoria;
  }
  limpiarCategoria(): void {
    this.categoriaSeleccionada = null;
    this.categoriaSearch       = 'Todos';
    this.categoriaOpen         = false;
    this.filtros.idCategoria   = null;
  }

  selectModalidad(m: ModalidadDTO): void {
    this.modalidadSeleccionada = m;
    this.modalidadSearch       = m.nombreModalidad;
    this.modalidadOpen         = false;
    this.filtros.idModalidad   = m.idModalidad;
  }
  limpiarModalidad(): void {
    this.modalidadSeleccionada = null;
    this.modalidadSearch       = 'Todos';
    this.modalidadOpen         = false;
    this.filtros.idModalidad   = null;
  }

  selectJornada(j: JornadaDTO): void {
    this.jornadaSeleccionada = j;
    this.jornadaSearch       = j.nombreJornada;
    this.jornadaOpen         = false;
    this.filtros.idJornada   = j.idJornada;
  }
  limpiarJornada(): void {
    this.jornadaSeleccionada = null;
    this.jornadaSearch       = 'Todos';
    this.jornadaOpen         = false;
    this.filtros.idJornada   = null;
  }

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
