import { Component, OnInit, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';

// ─── Interfaces de Catálogos ─────────────────────────────────────────────────
interface CategoriaDTO { idCategoria: number; nombreCategoria: string; }
interface ModalidadDTO { idModalidad: number; nombreModalidad: string; }
interface JornadaDTO   { idJornada:   number; nombreJornada:   string; }
interface CiudadDTO    { idCiudad:    number; nombreCiudad:    string; nombreProvincia: string; }

// ─── Interface de Estadísticas ───────────────────────────────────────────────
interface GraficoData {
  titulo: string;
  datos: { etiqueta: string; cantidad: number; porcentaje: number; color: string }[];
}

// ─── Opciones de Top ─────────────────────────────────────────────────────────
interface TopOpcion { label: string; valor: number | null; }

@Component({
  selector: 'app-reporte-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './Reporte-Empresa.html',
  styleUrls: ['./Reporte-Empresa.css']
})
export class ReporteEmpresaComponent implements OnInit {

  // ─── URLs del Backend ────────────────────────────────────────────────────
  private readonly API_BASE        = 'http://localhost:8080/api';
  private readonly API_REPORTE     = `${this.API_BASE}/reportes-empresa/ofertas`;
  private readonly API_CIUDADES    = `${this.API_BASE}/ciudades`;
  private readonly API_CATEGORIAS  = `${this.API_BASE}/categorias`;
  private readonly API_MODALIDADES = `${this.API_BASE}/modalidades`;
  private readonly API_JORNADAS    = `${this.API_BASE}/jornadas`;

  // ─── idEmpresa: se lee del localStorage al iniciar ───────────────────────
  idEmpresa: number | null = null;

  // ─── Estado Principal ────────────────────────────────────────────────────
  resultados:  any[]         = [];
  columnas:    string[]      = [];
  graficos:    GraficoData[] = [];

  cargando            = false;
  mostrandoResultados = false;
  mostrandoGrafico    = false;

  // ─── Alertas ─────────────────────────────────────────────────────────────
  mensajeExito = '';
  mensajeError = '';

  // ─── Paginación ──────────────────────────────────────────────────────────
  paginaActual   = 1;
  itemsPorPagina = 10;

  // ─── Catálogos ───────────────────────────────────────────────────────────
  ciudades:    CiudadDTO[]    = [];
  categorias:  CategoriaDTO[] = [];
  modalidades: ModalidadDTO[] = [];
  jornadas:    JornadaDTO[]   = [];

  estadosOferta = ['Activa', 'Inactiva', 'Cerrada'];

  // ─── Opciones Top ────────────────────────────────────────────────────────
  opcionesTop: TopOpcion[] = [
    { label: 'Todas',  valor: null },
    { label: 'Top 5',  valor: 5    },
    { label: 'Top 10', valor: 10   },
    { label: 'Top 15', valor: 15   },
    { label: 'Top 20', valor: 20   }
  ];

  // ─── Filtros ─────────────────────────────────────────────────────────────
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

  // ─── Comboboxes buscables ─────────────────────────────────────────────────
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

  // ─── Validaciones UI ─────────────────────────────────────────────────────
  erroresFiltros: string[] = [];

  // ─── Getters: filtrado de comboboxes ─────────────────────────────────────
  get ciudadesFiltradas():    CiudadDTO[]    { return this.ciudades.filter(c    => `${c.nombreCiudad} ${c.nombreProvincia}`.toLowerCase().includes(this.ciudadSearch.toLowerCase())); }
  get categoriasFiltradas():  CategoriaDTO[] { return this.categorias.filter(c  => c.nombreCategoria.toLowerCase().includes(this.categoriaSearch.toLowerCase())); }
  get modalidadesFiltradas(): ModalidadDTO[] { return this.modalidades.filter(m => m.nombreModalidad.toLowerCase().includes(this.modalidadSearch.toLowerCase())); }
  get jornadasFiltradas():    JornadaDTO[]   { return this.jornadas.filter(j    => j.nombreJornada.toLowerCase().includes(this.jornadaSearch.toLowerCase())); }

  // ─── Getters: paginación ─────────────────────────────────────────────────
  get resultadosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.resultados.slice(inicio, inicio + this.itemsPorPagina);
  }
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.resultados.length / this.itemsPorPagina));
  }
  get hoyISO(): string { return new Date().toISOString().split('T')[0]; }

  // ─── Getter: label del top seleccionado ──────────────────────────────────
  get labelTopSeleccionado(): string {
    const opcion = this.opcionesTop.find(o => o.valor === this.filtros.top);
    return opcion ? opcion.label : 'Todas';
  }

  constructor(
      private http:   HttpClient,
      private cdr:    ChangeDetectorRef,
      private ngZone: NgZone
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT — lee idEmpresa del localStorage (misma clave que guarda el login)
  // ═══════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    const idEmpresaStr = localStorage.getItem('idEmpresa');
    this.idEmpresa     = idEmpresaStr ? Number(idEmpresaStr) : null;

    this.cargarCatalogos();
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
  // LIMPIEZA
  // ═══════════════════════════════════════════════════════════════════════════
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

    this.filtros = {
      top: null, idCiudad: null, idCategoria: null, idModalidad: null,
      idJornada: null, fechaInicio: '', fechaFin: '',
      salarioMin: null, salarioMax: null, estadoOferta: ''
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

    // Validación crítica: idEmpresa obligatorio
    if (!this.idEmpresa) {
      this.erroresFiltros.push('No se pudo identificar la empresa. Por favor recargue la página.');
    }

    // Fechas
    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (new Date(this.filtros.fechaFin) < new Date(this.filtros.fechaInicio)) {
        this.erroresFiltros.push('La fecha fin no puede ser anterior a la fecha inicio.');
      }
    }
    if (this.filtros.fechaInicio && this.filtros.fechaInicio > this.hoyISO) {
      this.erroresFiltros.push('La fecha inicio no puede ser una fecha futura.');
    }
    if (this.filtros.fechaFin && this.filtros.fechaFin > this.hoyISO) {
      this.erroresFiltros.push('La fecha fin no puede ser una fecha futura.');
    }

    // Salarios
    if (this.filtros.salarioMin !== null && this.filtros.salarioMin < 0) {
      this.erroresFiltros.push('El salario mínimo no puede ser negativo.');
    }
    if (this.filtros.salarioMax !== null && this.filtros.salarioMax < 0) {
      this.erroresFiltros.push('El salario máximo no puede ser negativo.');
    }
    if (this.filtros.salarioMin !== null && this.filtros.salarioMax !== null
        && this.filtros.salarioMax < this.filtros.salarioMin) {
      this.erroresFiltros.push('El salario máximo no puede ser menor al salario mínimo.');
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
    this.cdr.detectChanges();

    // idEmpresa siempre se envía — es obligatorio en el backend
    let params = new HttpParams()
        .set('idEmpresa', this.idEmpresa!.toString());

    // Solo agrega parámetros opcionales que tengan valor
    Object.keys(this.filtros).forEach(key => {
      const val = (this.filtros as any)[key];
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, val.toString());
      }
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
  // GENERACIÓN DE GRÁFICOS — específica para reporte empresa
  // ═══════════════════════════════════════════════════════════════════════════
  private generarGraficos(data: any[]): void {
    this.graficos = [];

    const colores = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
      '#fa709a', '#fee140', '#30cfd0', '#a18cd1', '#fbc2eb'
    ];

    // ── Gráfico 1: Ofertas por total de postulaciones ────────────────────
    const itemsPostulaciones = [...data]
        .sort((a, b) => (Number(b.totalPostulaciones) || 0) - (Number(a.totalPostulaciones) || 0))
        .slice(0, 10);
    const maxPost = Math.max(...itemsPostulaciones.map(r => Number(r.totalPostulaciones) || 0)) || 1;

    this.graficos.push({
      titulo: 'Ofertas con más Postulaciones',
      datos: itemsPostulaciones.map((row, i) => ({
        etiqueta:   String(row['titulo'] || 'Sin título').substring(0, 30),
        cantidad:   Number(row['totalPostulaciones']) || 0,
        porcentaje: ((Number(row['totalPostulaciones']) || 0) / maxPost) * 100,
        color:      colores[i % colores.length]
      }))
    });

    // ── Gráfico 2: Estado de postulaciones (suma de todos los conteos) ────
    const totalPendientes = data.reduce((s, r) => s + (Number(r['postulacionesPendientes']) || 0), 0);
    const totalAceptadas  = data.reduce((s, r) => s + (Number(r['postulacionesAceptadas'])  || 0), 0);
    const totalRechazadas = data.reduce((s, r) => s + (Number(r['postulacionesRechazadas']) || 0), 0);
    const maxEstado       = Math.max(totalPendientes, totalAceptadas, totalRechazadas) || 1;

    this.graficos.push({
      titulo: 'Estado de Postulaciones',
      datos: [
        { etiqueta: 'Pendientes', cantidad: totalPendientes, porcentaje: (totalPendientes / maxEstado) * 100, color: '#fee140' },
        { etiqueta: 'Aceptadas',  cantidad: totalAceptadas,  porcentaje: (totalAceptadas  / maxEstado) * 100, color: '#43e97b' },
        { etiqueta: 'Rechazadas', cantidad: totalRechazadas, porcentaje: (totalRechazadas / maxEstado) * 100, color: '#fa709a' }
      ].filter(d => d.cantidad > 0)
    });

    // ── Gráfico 3: Ofertas por Categoría ─────────────────────────────────
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
            color:      colores[i % colores.length]
          }))
          .sort((a, b) => b.cantidad - a.cantidad)
          .slice(0, 10)
    });
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
      const titulo       = 'Reporte de Ofertas Laborales';

      // Cabecera
      doc.setFillColor(102, 126, 234);
      doc.rect(0, 0, 297, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(titulo, 15, 17);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-EC')}`, 230, 17);

      // Encabezados tabla
      doc.setTextColor(0, 0, 0);
      const colsExport = this.columnas.slice(0, 8);
      const colWidth   = (297 - 20) / colsExport.length;
      let y            = 35;

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
      const titulo = 'Ofertas';

      // Hoja 1: datos
      const wsData    = XLSX.utils.json_to_sheet(this.resultados);
      const colWidths = this.columnas.map(col => ({
        wch: Math.max(col.length, ...this.resultados.map(r => String(r[col] ?? '').length))
      }));
      wsData['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(wb, wsData, titulo);

      // Hoja 2: estadísticas
      if (this.graficos.length > 0) {
        const statsRows: (string | number)[][] = [['Estadísticas del Reporte'], []];
        this.graficos.forEach(g => {
          statsRows.push([g.titulo]);
          statsRows.push(['Descripción', 'Cantidad', 'Porcentaje']);
          g.datos.forEach(d =>
              statsRows.push([d.etiqueta, d.cantidad, `${d.porcentaje.toFixed(1)}%`])
          );
          statsRows.push([]);
        });
        const wsStats    = XLSX.utils.aoa_to_sheet(statsRows);
        wsStats['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
      }

      XLSX.writeFile(wb, `Reporte_Ofertas_${new Date().toISOString().split('T')[0]}.xlsx`);
      this.mostrarExito('Excel exportado correctamente.');

    } catch (e) {
      this.mostrarError('Error al exportar Excel. Verifique: npm install xlsx');
      console.error(e);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDAD: vistaPrevia asíncrona para exportaciones
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
  // SELECCIÓN COMBOBOXES
  // ═══════════════════════════════════════════════════════════════════════════
  selectCiudad(c: CiudadDTO): void {
    this.ciudadSeleccionada = c;
    this.ciudadSearch       = `${c.nombreCiudad} — ${c.nombreProvincia}`;
    this.ciudadOpen         = false;
    this.filtros.idCiudad   = c.idCiudad;
  }
  limpiarCiudad(): void {
    this.ciudadSeleccionada = null;
    this.ciudadSearch       = '';
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
    this.categoriaSearch       = '';
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
    this.modalidadSearch       = '';
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
    this.jornadaSearch       = '';
    this.filtros.idJornada   = null;
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
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
  }

  mostrarError(msg: string): void {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 6000);
  }
}
