import { Component, OnInit ,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfertaService, OfertaLaboralDTO, OfertaHabilidadDTO } from '../../services/oferta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-ofertas.html',
  styleUrls: ['./gestion-ofertas.css']
})
export class GestionOfertasComponent implements OnInit {

  ofertas: OfertaLaboralDTO[] = [];
  isModalOpen: boolean = false;

  idEmpresaLogueada: number = 0;

  nuevaOferta: OfertaLaboralDTO = this.inicializarOferta();

  tempIdHabilidad: number = 0;
  tempNivel: string = 'Básico';
  tempObligatorio: boolean = false;
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';

  constructor(private ofertaService: OfertaService,private router: Router,private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('idEmpresa');

    console.log("ID recuperado del localStorage:", idGuardado);

    if (idGuardado) {
      this.idEmpresaLogueada = Number(idGuardado);
      this.nuevaOferta.idEmpresa = this.idEmpresaLogueada;
      this.cargarOfertas();

    } else {

      this.router.navigate(['/login']);
    }
    }

  inicializarOferta(): OfertaLaboralDTO {
    return {
      idEmpresa: this.idEmpresaLogueada,
      idModalidad: 1,
      idCategoria: 1,
      idJornada: 1,
      idCiudad: 1,
      titulo: '',
      descripcion: '',
      salarioMin: 0,
      salarioMax: 0,
      cantidadVacantes: 0,
      experienciaMinima: 0,
      fechaInicio: '',
      fechaCierre: '',
      habilidades: []
    };
  }

  cargarOfertas(): void {


    this.ofertaService.obtenerOfertasPorEmpresa(this.idEmpresaLogueada).subscribe({
      next: (datosDelBackend) => {
        this.ofertas = datosDelBackend.map(oferta => {
          return {
            ...oferta,
            habilidades: typeof oferta.habilidades === 'string'
              ? JSON.parse(oferta.habilidades)
              : oferta.habilidades,

            requisitos_manuales: typeof oferta.requisitos_manuales === 'string'
              ? JSON.parse(oferta.requisitos_manuales)
              : oferta.requisitos_manuales
          };
        });

        this.cdr.detectChanges();
        console.log('Ofertas cargadas exitosamente:', this.ofertas);
      },
      error: (error) => {
        console.error('Error al cargar las ofertas de la empresa', error);
      }
    });
  }



  get ofertasFiltradas(): OfertaLaboralDTO[] {

    if (!this.ofertas) return [];

    return this.ofertas.filter((oferta: any) => {

      const titulo = oferta.titulo ? oferta.titulo.toLowerCase() : '';
      const descripcion = oferta.descripcion ? oferta.descripcion.toLowerCase() : '';
      const texto = this.textoBusqueda ? this.textoBusqueda.toLowerCase() : '';

      const coincideTexto = titulo.includes(texto) || descripcion.includes(texto);
      const estadoReal = oferta.estadoOferta || oferta.estado_oferta || '';

      const coincideEstado = this.filtroEstado === 'Todos' ||
        estadoReal.toLowerCase() === this.filtroEstado.toLowerCase();

      return coincideTexto && coincideEstado;
    });
  }
  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  agregarSkill() {
    if (Number(this.tempIdHabilidad) > 0) {

      const mapNombres: any = { 1: 'Java', 2: 'SQL' };

      const skill: OfertaHabilidadDTO = {
        idHabilidad: Number(this.tempIdHabilidad),
        nivelRequerido: this.tempNivel,
        esObligatorio: this.tempObligatorio,
        nombreHabilidad: mapNombres[this.tempIdHabilidad] || 'Skill ' + this.tempIdHabilidad
      };

      this.nuevaOferta.habilidades.push(skill);

      this.tempIdHabilidad = 0;
      this.tempNivel = 'Básico';
      this.tempObligatorio = false;
    }
  }

  removerSkill(index: number) {
    this.nuevaOferta.habilidades.splice(index, 1);
  }

  guardar() {
    this.ofertaService.crearOferta(this.nuevaOferta).subscribe({
      next: (resp) => {
        alert('¡Oferta creada con éxito!');
        this.closeModal();
        this.nuevaOferta = this.inicializarOferta();
        this.cargarOfertas();
      },
      error: (err) => {

        if (err.status === 200 || err.status === 201) {
          alert('¡Oferta creada con éxito!');
          this.closeModal();
          this.nuevaOferta = this.inicializarOferta();
          this.cargarOfertas();
        } else {
          console.error("Detalle del error:", err);
          alert('Error al guardar. Revisa la consola.');
        }
      }
    });
  }
}
