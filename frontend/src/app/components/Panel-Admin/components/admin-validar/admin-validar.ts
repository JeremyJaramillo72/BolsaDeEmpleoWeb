import { Component, OnInit, HostListener , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { UiNotificationService } from '../../../../services/ui-notification.service';
import { ConfirmService } from '../../../../services/confirm.service';

@Component({
  selector: 'admin-validar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-validar.html',
  styleUrls: ['./admin-validar.css']
})
export class AdminValidarComponent implements OnInit {

  offers: any[] = [];
  cargando: boolean = false;

  // Sidebar
  ofertaSeleccionada: any = null;
  mostrarModal: boolean = false;

  // Dropdown
  menuAbiertoId: number | null = null;

  // Filtros
  filtroTexto: string = '';
  soloHoy: boolean = false;
  fechaFiltro: string = '';
  estadoActual: string = 'pendiente';

  // Sub-filtro para ofertas aprobadas
  subFiltroAprobado: string = 'todas';

  // Orden de fecha: false = newest first, true = oldest first
  sortAsc: boolean = false;

  // Cached filtered & sorted offers used for pagination
  filteredOffers: any[] = [];

  // Conteo de postulantes por oferta
  conteoPostulantes: {[key: number]: number} = {};

  constructor(
    private adminService: AdminService,
    private crd: ChangeDetectorRef,
    private ui: UiNotificationService,
    private confirmService: ConfirmService
  )
  { }

  ngOnInit(): void {
    this.cargarOfertas('pendiente');
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.menuAbiertoId = null;
    this.crd.detectChanges();
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation();
    this.menuAbiertoId = this.menuAbiertoId === id ? null : id;
    this.crd.detectChanges();
  }

  cerrarMenu() {
    this.menuAbiertoId = null;
  }

  toggleHoy() {
    this.soloHoy = !this.soloHoy;
    if (this.soloHoy) this.fechaFiltro = '';
    this.updateFilteredOffers(true);
  }

  cambiarTab(estado: string) {
    this.estadoActual = estado;
    this.subFiltroAprobado = 'todas';
    this.currentPage = 1;
    this.cargarOfertas(estado);
    this.crd.detectChanges();
  }

  cambiarSubFiltro(sub: string) {
    this.subFiltroAprobado = sub;
    this.updateFilteredOffers(true);
  }

  toggleSortDate() {
    this.sortAsc = !this.sortAsc;
    this.updateFilteredOffers(true);
  }

  cargarOfertas(estado: string) {
    this.cargando = true;
    this.offers = [];

    this.adminService.obtenerOfertasPorEstado(estado).subscribe({
      next: (data) => {
        this.offers = data || [];
        this.cargando = false;
        this.updateFilteredOffers(true);
        if (estado === 'aprobado') {
          this.cargarConteoPostulantes();
        }
      },
      error: (e) => {
        console.error('Error:', e);
        this.cargando = false;
      }
    });
  }

  cargarConteoPostulantes() {
    const ids = this.offers.map((o: any) => o.idOferta);
    if (ids.length === 0) return;
    this.adminService.contarPostulantesPorOfertas(ids).subscribe({
      next: (conteo) => {
        this.conteoPostulantes = conteo;
        this.crd.detectChanges();
      },
      error: (e) => console.error('Error al cargar conteo:', e)
    });
  }

  // Recalcula la lista filtrada/ordenada y actualiza paginación
  updateFilteredOffers(resetPage: boolean = false) {
    let filtradas = this.offers.filter(oferta => {
      const texto = this.filtroTexto.toLowerCase();
      const nombreEmpresa = (oferta.nombreEmpresa || oferta.rucEmpresa || oferta.ruc_empresa || oferta.nombre_empresa || '').toString().toLowerCase();

      const coincideTexto =
        (oferta.titulo || '').toString().toLowerCase().includes(texto) ||
        nombreEmpresa.includes(texto);

      const fechaOferta = oferta.fechaInicio?.toString().split('T')[0] ?? '';

      let coincideFecha = true;
      if (this.soloHoy) {
        const hoy = new Date().toISOString().split('T')[0];
        coincideFecha = fechaOferta === hoy;
      } else if (this.fechaFiltro) {
        coincideFecha = fechaOferta === this.fechaFiltro;
      }

      return coincideTexto && coincideFecha;
    });

    // Sub-filtro para ofertas aprobadas: activas vs cerradas
    if (this.estadoActual === 'aprobado' && this.subFiltroAprobado !== 'todas') {
      filtradas = filtradas.filter(oferta => {
        const vencida = this.estaVencida(oferta);
        return this.subFiltroAprobado === 'activas' ? !vencida : vencida;
      });
    }

    // Ordenar por fechaInicio según `sortAsc` (true = ascendente / más lejanas primero)
    filtradas.sort((a: any, b: any) => {
      const ta = a?.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const tb = b?.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return this.sortAsc ? ta - tb : tb - ta;
    });

    this.filteredOffers = filtradas;
    if (resetPage) this.currentPage = 1;
    this.crd.detectChanges();
  }

  estaVencida(oferta: any): boolean {
    if (!oferta.fechaCierre) return false;
    const cierre = new Date(oferta.fechaCierre);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return cierre < hoy;
  }

  aprobar(oferta: any) {
    if (this.estaVencida(oferta)) {
      this.ui.advertencia('No se puede aprobar una oferta que ya vencio.');
      return;
    }
    this.confirmService.abrir(`Aprobar la oferta "${oferta.titulo}"?`).then(acepto => {
      if (!acepto) return;
      this.procesar(oferta, 'aprobado');
      this.crd.detectChanges();
    });
  }

  rechazar(oferta: any) {
    if (this.estaVencida(oferta)) {
      this.ui.advertencia('No se puede rechazar una oferta que ya vencio.');
      return;
    }
    this.confirmService.abrir(`Rechazar la oferta "${oferta.titulo}"?`).then(acepto => {
      if (!acepto) return;
      this.procesar(oferta, 'rechazada');
      this.crd.detectChanges();
    });
  }

  private procesar(oferta: any, estadoNuevo: string) {
    const id = oferta.idOferta;
    this.adminService.validarOfertas(id, estadoNuevo).subscribe({
      next: () => {
        this.ui.exito(`Oferta ${estadoNuevo} con exito`);
        this.cerrarModal();
        this.cargarOfertas(this.estadoActual);
        this.crd.detectChanges();
      },
      error: () => this.ui.error('Error al procesar la solicitud')
    });
  }

  verDetalles(oferta: any) {
    this.ofertaSeleccionada = oferta;
    this.mostrarModal = true;
    this.crd.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.ofertaSeleccionada = null;
    this.crd.detectChanges();
  }

  get conteoActivas(): number {
    return this.offers.filter(o => !this.estaVencida(o)).length;
  }

  get conteoCerradas(): number {
    return this.offers.filter(o => this.estaVencida(o)).length;
  }

  get ofertasFiltradas() {
    return this.filteredOffers;
  }

  // Paginación
  currentPage: number = 1;
  pageSize: number = 7;

  onFilterChange() {
    this.updateFilteredOffers(true);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOffers.length / this.pageSize));
  }

  // Rango mostrado en la paginación
  get displayStart(): number {
    if (this.filteredOffers.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredOffers.length);
  }

  get ofertasPagina() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOffers.slice(start, start + this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.crd.detectChanges();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.crd.detectChanges();
    }
  }

  goToPage(n: number) {
    if (n >= 1 && n <= this.totalPages) {
      this.currentPage = n;
      this.crd.detectChanges();
    }
  }

}
