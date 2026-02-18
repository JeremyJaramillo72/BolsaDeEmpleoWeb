import { Component, OnInit, HostListener , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { FormsModule } from '@angular/forms';

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

  // Dropdown — guarda el ID del menú abierto (null = cerrado)
  menuAbiertoId: number | null = null;

  // Filtros
  filtroTexto: string = '';
  soloHoy: boolean = false;
  fechaFiltro: string = '';   // ← fecha personalizada YYYY-MM-DD
  estadoActual: string = 'PENDIENTE';

  constructor(
    private adminService: AdminService,
    private crd: ChangeDetectorRef
  )
  { }

  ngOnInit(): void {
    this.cargarOfertas('PENDIENTE');
  }

  // Cierra el menú si el usuario hace clic fuera
  @HostListener('document:click')
  onDocumentClick() {
    this.menuAbiertoId = null;
    this.crd.detectChanges();
  }

  toggleMenu(id: number, event: Event) {
    event.stopPropagation(); // evita que el HostListener lo cierre al instante
    this.menuAbiertoId = this.menuAbiertoId === id ? null : id;
    this.crd.detectChanges();
  }

  cerrarMenu() {
    this.menuAbiertoId = null;
  }

  toggleHoy() {
    this.soloHoy = !this.soloHoy;
    if (this.soloHoy) this.fechaFiltro = '';
    this.crd.detectChanges();
  }

  cambiarTab(estado: string) {
    this.estadoActual = estado;
    this.cargarOfertas(estado);
    this.crd.detectChanges();
  }

  cargarOfertas(estado: string) {
    this.cargando = true;
    this.offers = [];

    this.adminService.obtenerOfertasPorEstado(estado).subscribe({
      next: (data) => {
        this.offers = data;
        this.cargando = false;
        this.crd.detectChanges();
      },
      error: (e) => {
        console.error('Error:', e);
        this.cargando = false;
      }
    });
  }

  aprobar(oferta: any) {
    if (!confirm(`¿Aprobar la oferta "${oferta.titulo}"?`)) return;
    this.procesar(oferta, 'APROBADA');
    this.crd.detectChanges();
  }

  rechazar(oferta: any) {
    if (!confirm(`¿Rechazar la oferta "${oferta.titulo}"?`)) return;
    this.procesar(oferta, 'RECHAZADA');
    this.crd.detectChanges();
  }

  private procesar(oferta: any, estadoNuevo: string) {
    const id = oferta.idOferta;
    this.adminService.validarOfertas(id, estadoNuevo).subscribe({
      next: () => {
        alert(`Oferta ${estadoNuevo} con éxito`);
        this.cerrarModal();
        this.cargarOfertas(this.estadoActual);
        this.crd.detectChanges();
      },
      error: () => alert('Error al procesar la solicitud')
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

  get ofertasFiltradas() {
    return this.offers.filter(oferta => {
      const texto = this.filtroTexto.toLowerCase();
      const nombreEmpresa = oferta.nombreEmpresa || oferta.rucEmpresa || '';

      const coincideTexto =
        oferta.titulo.toLowerCase().includes(texto) ||
        nombreEmpresa.toLowerCase().includes(texto);

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
  }
}
