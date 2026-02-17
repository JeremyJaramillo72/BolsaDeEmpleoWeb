import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfertaService } from '../../services/oferta.service';

@Component({
  selector: 'app-revision-postulantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-postulantes.html',
  styleUrls: ['./revision-postulantes.css']
})
export class RevisionPostulantesComponent implements OnInit {

  ofertas: any[] = [];
  idEmpresaLogueada: number = 0;
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('idEmpresa');
    if (idGuardado) {
      this.idEmpresaLogueada = Number(idGuardado);
      this.cargarOfertasParaRevision();
      this.cdr.detectChanges();
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarOfertasParaRevision(): void {
    this.ofertaService.obtenerOfertasPorEmpresa(this.idEmpresaLogueada).subscribe({
      next: (data) => {
        const ofertasMapeadas = data.map((o: any) => ({
          ...o,
          estadoOferta: (o.estado_oferta || o.estadoOferta || 'pendiente').toLowerCase(),
          fechaCierre: o.fecha_cierre || o.fechaCierre,
          postulantes: Number(o.postulantes || 0)
        }));


        this.ofertas = ofertasMapeadas.filter(o => o.estadoOferta !== 'pendiente');
      },
      error: (err) => console.error('Error al cargar ofertas:', err)
    });
  }


  get ofertasFiltradas(): any[] {
    return this.ofertas.filter(o => {
      const coincideTexto = o.titulo.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideEstado = this.filtroEstado === 'Todos' || o.estadoOferta === this.filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.filtroEstado = 'Todos';
  }

  verCandidatos(idOferta: number): void {
    this.router.navigate(['/empresa/oferta', idOferta, 'candidatos']);
  }
}


