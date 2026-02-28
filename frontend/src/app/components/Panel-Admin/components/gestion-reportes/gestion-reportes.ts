import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';

// ─── Interfaces de Catálogos ────────────────────────────────────────────────
interface CiudadDTO    { idCiudad: number;    nombreCiudad: string;    nombreProvincia: string; }
interface CategoriaDTO { idCategoria: number; nombreCategoria: string; }
interface ModalidadDTO { idModalidad: number; nombreModalidad: string; }
interface JornadaDTO   { idJornada: number;   nombreJornada: string;   }

// ─── Interface de Estadísticas ───────────────────────────────────────────────
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
export class GestionReportesComponent implements OnInit {

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

  estadosOfertas     = ['Activa', 'Inactiva', 'Cerrada'];
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
    estadoOferta: 'Activa'
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
  ciudadSearch        = '';
  ciudadOpen          = false;
  ciudadSeleccionada: CiudadDTO | null = null;

  categoriaSearch        = '';
  categoriaOpen          = false;
  categoriaSeleccionada: CategoriaDTO | null = null;

  modalidadSearch        = '';
  modalidadOpen          = false;
  modalidadSeleccionada: ModalidadDTO | null = null;

  jornadaSearch        = '';
  jornadaOpen          = false;
  jornadaSeleccionada: JornadaDTO | null = null;

  // ─── Validaciones UI ────────────────────────────────────────────────────
  erroresFiltros: string[] = [];

  // ─── Getters: filtrado de comboboxes ────────────────────────────────────
  get ciudadesFiltradas():    CiudadDTO[]    { return this.ciudades.filter(c    => `${c.nombreCiudad} ${c.nombreProvincia}`.toLowerCase().includes(this.ciudadSearch.toLowerCase())); }
  get categoriasFiltradas():  CategoriaDTO[] { return this.categorias.filter(c  => c.nombreCategoria.toLowerCase().includes(this.categoriaSearch.toLowerCase())); }
  get modalidadesFiltradas(): ModalidadDTO[] { return this.modalidades.filter(m => m.nombreModalidad.toLowerCase().includes(this.modalidadSearch.toLowerCase())); }
  get jornadasFiltradas():    JornadaDTO[]   { return this.jornadas.filter(j    => j.nombreJornada.toLowerCase().includes(this.jornadaSearch.toLowerCase())); }

  // ─── Getters: paginación ────────────────────────────────────────────────
  get resultadosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.resultados.slice(inicio, inicio + this.itemsPorPagina);
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.resultados.length / this.itemsPorPagina));
  }
  get hoyISO(): string { return new Date().toISOString().split('T')[0]; }

  // ─── Constructor con ChangeDetectorRef y NgZone ──────────────────────────
  // CORRECCIÓN CRÍTICA: El componente es standalone con HttpClientModule
  // importado localmente. Las respuestas HTTP pueden ejecutarse fuera de
  // la zona de Angular, por lo que la vista no se actualiza automáticamente.
  // NgZone.run() garantiza que cada cambio de estado se procese dentro de
  // la zona de Angular. ChangeDetectorRef.detectChanges() fuerza la
  // actualización de la vista después de cada cambio.
  constructor(
    private http:  HttpClient,
    private cdr:   ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARGA DE CATÁLOGOS
  // ═══════════════════════════════════════════════════════════════════════════
  cargarCatalogos(): void {
    this.http.get<CiudadDTO[]>(this.API_CIUDADES).subscribe({
      next: data => this.ngZone.run(() => {
        this.ciudades = data;
        this.cdr.detectChanges();
      }),
      error: err => console.error('Error al cargar ciudades:', err)
    });

    this.http.get<CategoriaDTO[]>(this.API_CATEGORIAS).subscribe({
      next: data => this.ngZone.run(() => {
        this.categorias = data;
        this.cdr.detectChanges();
      }),
      error: err => console.error('Error al cargar categorías:', err)
    });

    this.http.get<ModalidadDTO[]>(this.API_MODALIDADES).subscribe({
      next: data => this.ngZone.run(() => {
        this.modalidades = data;
        this.cdr.detectChanges();
      }),
      error: err => console.error('Error al cargar modalidades:', err)
    });

    this.http.get<JornadaDTO[]>(this.API_JORNADAS).subscribe({
      next: data => this.ngZone.run(() => {
        this.jornadas = data;
        this.cdr.detectChanges();
      }),
      error: err => console.error('Error al cargar jornadas:', err)
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
      estadoOferta: 'Activa'
    };
    this.filtrosPostulaciones = {
      idCiudad: null, idCategoria: null, idModalidad: null,
      estadoValidacion: '', fechaInicio: '', fechaFin: ''
    };

    this.ciudadSeleccionada    = null; this.ciudadSearch    = ''; this.ciudadOpen    = false;
    this.categoriaSeleccionada = null; this.categoriaSearch = ''; this.categoriaOpen = false;
    this.modalidadSeleccionada = null; this.modalidadSearch = ''; this.modalidadOpen = false;
    this.jornadaSeleccionada   = null; this.jornadaSearch   = ''; this.jornadaOpen   = false;

    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════════════════
  private validarFiltros(): boolean {
    this.erroresFiltros = [];
    const f = this.tipoReporte === 'ofertas'
      ? this.filtrosOfertas
      : this.filtrosPostulaciones;

    if (f.fechaInicio && f.fechaFin) {
      if (new Date(f.fechaFin) < new Date(f.fechaInicio)) {
        this.erroresFiltros.push('La fecha fin no puede ser anterior a la fecha inicio.');
      }
    }
    if (f.fechaInicio && f.fechaInicio > this.hoyISO) {
      this.erroresFiltros.push('La fecha inicio no puede ser una fecha futura.');
    }
    if (f.fechaFin && f.fechaFin > this.hoyISO) {
      this.erroresFiltros.push('La fecha fin no puede ser una fecha futura.');
    }

    if (this.tipoReporte === 'ofertas') {
      const fo = this.filtrosOfertas;
      if (fo.salarioMin !== null && fo.salarioMin < 0) {
        this.erroresFiltros.push('El salario mínimo no puede ser negativo.');
      }
      if (fo.salarioMax !== null && fo.salarioMax < 0) {
        this.erroresFiltros.push('El salario máximo no puede ser negativo.');
      }
      if (fo.salarioMin !== null && fo.salarioMax !== null
        && fo.salarioMax < fo.salarioMin) {
        this.erroresFiltros.push('El salario máximo no puede ser menor al salario mínimo.');
      }
    }

    return this.erroresFiltros.length === 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA PREVIA
  // ═══════════════════════════════════════════════════════════════════════════
  vistaPrevia(): void {
    if (!this.validarFiltros()) return;

    this.cargando            = true;
    this.mostrandoResultados = false;
    this.mostrandoGrafico    = false;
    this.cdr.detectChanges(); // Muestra el spinner inmediatamente

    const url    = this.tipoReporte === 'ofertas' ? this.API_OFERTAS : this.API_POSTULACIONES;
    const filtro = this.tipoReporte === 'ofertas' ? this.filtrosOfertas : this.filtrosPostulaciones;

    let params = new HttpParams();
    Object.keys(filtro).forEach(key => {
      const val = (filtro as any)[key];
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, val.toString());
      }
    });

    this.http.get<any[]>(url, { params }).subscribe({
      next: data => {
        // NgZone.run garantiza que Angular detecte todos los cambios
        // que ocurren dentro del callback HTTP
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
          this.cdr.detectChanges(); // Fuerza actualización de la vista
        });
      },
      error: err => {
        this.ngZone.run(() => {
          const msg = err.error?.message || 'Error al conectar con el servidor.';
          this.mostrarError(msg);
          console.error(err);
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADÍSTICAS
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
            });
          }
        }
      }, 200);
      return;
    }
    this.mostrandoGrafico    = true;
    this.mostrandoResultados = false;
    this.cdr.detectChanges();
  }

  verTabla(): void {
    this.mostrandoGrafico    = false;
    this.mostrandoResultados = true;
    this.cdr.detectChanges();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GENERACIÓN DE GRÁFICOS
  // ═══════════════════════════════════════════════════════════════════════════
  private generarGraficos(data: any[]): void {
    this.graficos = [];

    const colores = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
      '#fa709a', '#fee140', '#30cfd0', '#a18cd1', '#fbc2eb'
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
  async exportarPDF(): Promise<void> {
    if (this.resultados.length === 0) {
      await this.ejecutarVistaPreviaAsync();
    }
    if (this.resultados.length === 0) {
      this.mostrarError('No hay datos para exportar.');
      return;
    }

    try {
      const jsPDFModule = await import('jspdf');
      const html2canvas  = (await import('html2canvas')).default;
      const { jsPDF }    = jsPDFModule;
      const doc          = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const titulo = this.tipoReporte === 'ofertas'
        ? 'Reporte de Ofertas Laborales'
        : 'Reporte de Postulaciones';

      // Cabecera
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 297, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(titulo, 15, 17);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-EC')}`, 230, 17);

      // Tabla
      doc.setTextColor(0, 0, 0);
      const colsExport = this.columnas.slice(0, 8);
      const colWidth   = (297 - 20) / colsExport.length;
      let y            = 35;

      // Encabezados de tabla
      doc.setFillColor(240, 240, 240);
      doc.rect(10, y - 5, 277, 8, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      colsExport.forEach((col, i) => {
        doc.text(this.formatearColumna(col), 12 + i * colWidth, y);
      });
      y += 6;

      // Filas
      doc.setFont('helvetica', 'normal');
      this.resultados.forEach((fila, idx) => {
        if (y > 185) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 255);
          doc.rect(10, y - 4, 277, 7, 'F');
        }
        colsExport.forEach((col, i) => {
          const val = fila[col] != null ? String(fila[col]).substring(0, 25) : '-';
          doc.text(val, 12 + i * colWidth, y);
        });
        y += 7;
      });

      // Segunda página con gráficos
      if (this.graficos.length > 0) {
        doc.addPage();
        doc.setFillColor(102, 126, 234);
        doc.rect(0, 0, 297, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Estadísticas', 15, 14);

        const chartEl = document.getElementById('charts-export-area');
        if (chartEl) {
          const canvas  = await html2canvas(chartEl, { scale: 1.5 });
          const imgData = canvas.toDataURL('image/png');
          doc.addImage(imgData, 'PNG', 10, 25, 277, 150);
        }
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
    if (this.resultados.length === 0) {
      await this.ejecutarVistaPreviaAsync();
    }
    if (this.resultados.length === 0) {
      this.mostrarError('No hay datos para exportar.');
      return;
    }

    try {
      const wb     = XLSX.utils.book_new();
      const titulo = this.tipoReporte === 'ofertas' ? 'Ofertas' : 'Postulaciones';

      // ── Hoja 1: Datos del reporte ──
      const wsData = XLSX.utils.json_to_sheet(this.resultados);
      const colWidths = this.columnas.map(col => ({
        wch: Math.max(
          col.length,
          ...this.resultados.map(r => String(r[col] ?? '').length)
        )
      }));
      wsData['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, wsData, titulo);

      // ── Hoja 2: Estadísticas ──
      if (this.graficos.length > 0) {
        const statsRows: (string | number)[][] = [
          ['Estadísticas del Reporte'],
          []
        ];
        this.graficos.forEach(g => {
          statsRows.push([g.titulo]);
          statsRows.push(['Categoría', 'Cantidad', 'Porcentaje']);
          g.datos.forEach(d =>
            statsRows.push([d.etiqueta, d.cantidad, `${d.porcentaje.toFixed(1)}%`])
          );
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

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDAD: ejecutar vistaPrevia y esperar a que termine
  // ═══════════════════════════════════════════════════════════════════════════
  private ejecutarVistaPreviaAsync(): Promise<void> {
    return new Promise(resolve => {
      this.vistaPrevia();
      const check = setInterval(() => {
        if (!this.cargando) { clearInterval(check); resolve(); }
      }, 200);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGINACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  cambiarPagina(p: number): void {
    if (p >= 1 && p <= this.totalPaginas) {
      this.paginaActual = p;
      this.cdr.detectChanges();
    }
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
    this.ciudadSearch                  = '';
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
    this.categoriaSearch                  = '';
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
    this.modalidadSearch                  = '';
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
    this.jornadaSearch            = '';
    this.filtrosOfertas.idJornada = null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CERRAR DROPDOWNS AL HACER CLIC FUERA
  // ═══════════════════════════════════════════════════════════════════════════
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.ciudadOpen = this.categoriaOpen = this.modalidadOpen = this.jornadaOpen = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES DE FORMATO
  // ═══════════════════════════════════════════════════════════════════════════
  formatearColumna(col: string): string {
    return col
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  formatearValor(val: any): string {
    if (val == null) return '—';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
      return new Date(val).toLocaleDateString('es-EC');
    }
    if (typeof val === 'number' && val > 100) {
      return `$${val.toFixed(2)}`;
    }
    return String(val);
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => {
      this.mensajeExito = '';
      this.cdr.detectChanges();
    }, 5000);
  }

  mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => {
      this.mensajeError = '';
      this.cdr.detectChanges();
    }, 6000);
  }
}
