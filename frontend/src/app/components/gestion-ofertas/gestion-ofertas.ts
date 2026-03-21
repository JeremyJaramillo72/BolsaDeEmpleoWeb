import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfertaService, OfertaLaboralDTO, OfertaHabilidadDTO } from '../../services/oferta.service';
import { Router } from '@angular/router';
import { UiNotificationService } from '../../services/ui-notification.service';

@Component({
  selector: 'app-gestion-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-ofertas.html',
  styleUrls: ['./gestion-ofertas.css']
})
export class GestionOfertasComponent implements OnInit {


  ofertas: OfertaLaboralDTO[] = [];
  listaCategorias: any[] = [];
  listaModalidades: any[] = [];
  listaJornadas: any[] = [];
  listaProvincias: any[] = [];
  listaCiudades: any[] = [];
  listaTiposHabilidad: any[] = [];
  listaHabilidadesFiltradas: any[] = [];
  guardando: boolean = false;

  mostrarFormulario: boolean = false;
  idEmpresaLogueada: number = 0;
  estadoOriginal: string = '';
  textoBusqueda: string = '';
  filtroEstado: string = 'Todos';


  tempIdProvincia: number = 0;
  tempIdTipoHabilidad: number = 0;
  tempIdHabilidad: number = 0;
  tempNivel: string = 'Básico';
  tempObligatorio: boolean = false;
  tempRequisitoManual: string = '';


  nuevaOferta: any;

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService
  ) {
    this.nuevaOferta = this.inicializarOferta();
  }

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('idEmpresa');

    if (idGuardado) {
      this.idEmpresaLogueada = Number(idGuardado);
      this.nuevaOferta.idEmpresa = this.idEmpresaLogueada;
      this.cargarOfertas();
      this.cargarCatalogosDinamicos();
    } else {
      this.router.navigate(['/login']);
    }
  }


  cargarOfertas(): void {
    this.ofertaService.obtenerOfertasPorEmpresa(this.idEmpresaLogueada).subscribe({
      next: (datosDelBackend) => {

        const fechaLocal = new Date();
        const anio = fechaLocal.getFullYear();
        const mes = String(fechaLocal.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaLocal.getDate()).padStart(2, '0');
        const hoyStr = `${anio}-${mes}-${dia}`;

        this.ofertas = datosDelBackend.map((oferta: any) => {
          let estadoReal = (oferta.estado_oferta || oferta.estadoOferta || 'pendiente').toLowerCase();
          const fechaCierre = oferta.fecha_cierre || oferta.fechaCierre;

          if (estadoReal !== 'rechazada' && fechaCierre && fechaCierre < hoyStr) {
            estadoReal = 'cerrada';
          }

          return {
            ...oferta,
            estadoOferta: estadoReal,
            fechaCierre: fechaCierre,
            salarioMin: oferta.salario_min || oferta.salarioMin,
            salarioMax: oferta.salario_max || oferta.salarioMax,

            habilidades: typeof oferta.habilidades === 'string'
              ? JSON.parse(oferta.habilidades)
              : oferta.habilidades,

            requisitos_manuales: typeof oferta.requisitos_manuales === 'string'
              ? JSON.parse(oferta.requisitos_manuales)
              : oferta.requisitos_manuales
          };
        });
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al cargar ofertas:', error)
    });
  }

  get ofertasFiltradas(): OfertaLaboralDTO[] {
    if (!this.ofertas) return [];

    return this.ofertas.filter((oferta: any) => {
      const titulo = oferta.titulo ? oferta.titulo.toLowerCase() : '';
      const descripcion = oferta.descripcion ? oferta.descripcion.toLowerCase() : '';
      const texto = this.textoBusqueda ? this.textoBusqueda.toLowerCase().trim() : '';

      const coincideTexto = texto === '' || titulo.includes(texto) || descripcion.includes(texto);

      const estadoReal = (oferta.estadoOferta || oferta.estado_oferta || 'pendiente').toString().toLowerCase();
      const estadoFiltro = this.filtroEstado.toLowerCase();

      let coincideEstado = false;

      if (estadoFiltro === 'todos') {
        coincideEstado = true;
      }
      else if (estadoFiltro === 'aprobado' && (estadoReal === 'aprobado' || estadoReal === 'activa')) {
        coincideEstado = true;
      }
      else if (estadoFiltro === 'rechazada' && (estadoReal === 'rechazada' || estadoReal === 'rechazado')) {
        coincideEstado = true;
      }
      else if (estadoFiltro === 'cerrada' && estadoReal === 'cerrada') {
        coincideEstado = true;
      }
      else if (estadoFiltro === 'pendiente' && estadoReal === 'pendiente') {
        coincideEstado = true;
      }
      return coincideTexto && coincideEstado;
    });
  }

  cargarCatalogosDinamicos() {
    this.ofertaService.obtenerCategorias().subscribe(res => this.listaCategorias = res);
    this.ofertaService.obtenerModalidades().subscribe(res => this.listaModalidades = res);
    this.ofertaService.obtenerJornadas().subscribe(res => this.listaJornadas = res);
    this.ofertaService.obtenerProvincias().subscribe(res => this.listaProvincias = res);
    this.ofertaService.obtenerTiposHabilidad().subscribe(res => this.listaTiposHabilidad = res);
  }


  onProvinciaChange() {
    this.nuevaOferta.idCiudad = null;
    this.listaCiudades = [];

    if (this.tempIdProvincia > 0) {
      this.ofertaService.obtenerProvinciasPorCiudad(this.tempIdProvincia).subscribe(res => {
        this.listaCiudades = res;
      });
    }
  }

  onTipoHabilidadChange() {
    this.tempIdHabilidad = 0;
    this.listaHabilidadesFiltradas = [];

    if (this.tempIdTipoHabilidad > 0) {
      this.ofertaService.obtenerHabilidadesPorTipo(this.tempIdTipoHabilidad).subscribe(res => {
        this.listaHabilidadesFiltradas = res;
      });
    }
  }


  inicializarOferta() {
    return {
      idOferta: null,
      idEmpresa: this.idEmpresaLogueada || 0,
      idModalidad: 1,
      idCategoria: 1,
      idJornada: 1,
      idProvincia: 0,
      idCiudad: null,
      titulo: '',
      descripcion: '',
      salarioMin: null,
      salarioMax: null,
      cantidadVacantes: 1,
      experienciaMinima: 0,
      fechaCierre: '',
      estadoOferta: 'pendiente',
      habilidades: [],
      requisitos_manuales: []
    };
  }

  abrirFormulario() {
    this.nuevaOferta = this.inicializarOferta();
    this.tempIdProvincia = 0;
    this.listaCiudades = [];
    this.estadoOriginal = 'pendiente';
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
  }

  editarOferta(ofertaSeleccionada: any) {

    const oferta = JSON.parse(JSON.stringify(ofertaSeleccionada));
    const estadoReal = (oferta.estado_oferta || oferta.estadoOferta || 'pendiente').toLowerCase();

    this.estadoOriginal = estadoReal;


    this.nuevaOferta = {
      idOferta: oferta.id_oferta || oferta.idOferta,
      idEmpresa: oferta.id_empresa || oferta.idEmpresa,
      idModalidad: Number(oferta.id_modalidad || oferta.idModalidad || 0),
      idCategoria: Number(oferta.id_categoria || oferta.idCategoria || 0),
      idJornada: Number(oferta.id_jornada || oferta.idJornada || 0),
      idProvincia: Number(oferta.id_provincia || oferta.idProvincia || 0),
      idCiudad: null,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      salarioMin: oferta.salario_min || oferta.salarioMin,
      salarioMax: oferta.salario_max || oferta.salarioMax,
      cantidadVacantes: oferta.cantidad_vacantes || oferta.cantidadVacantes,
      experienciaMinima: oferta.experiencia_minima || oferta.experienciaMinima,
      fechaCierre: oferta.fecha_cierre || oferta.fechaCierre || '',
      estadoOferta: estadoReal,
      habilidades: oferta.habilidades || [],
      requisitos_manuales: oferta.requisitos_manuales || []
    };

    this.tempIdProvincia = this.nuevaOferta.idProvincia;


    if (this.tempIdProvincia > 0) {
      this.ofertaService.obtenerProvinciasPorCiudad(this.tempIdProvincia).subscribe(res => {
        this.listaCiudades = res;
        setTimeout(() => {
          this.nuevaOferta.idCiudad = Number(oferta.id_ciudad || oferta.idCiudad || 0);
          this.cdr.detectChanges();
        }, 50);
      });
    } else {
      this.listaCiudades = [];
    }

    this.mostrarFormulario = true;
  }


  agregarSkill() {
    if (Number(this.tempIdHabilidad) > 0) {
      const habilidadSeleccionada = this.listaHabilidadesFiltradas.find(h => h.idHabilidad == this.tempIdHabilidad);
      const nombreHab = habilidadSeleccionada ? habilidadSeleccionada.nombreHabilidad : 'Desconocida';

      const skill: OfertaHabilidadDTO = {
        idHabilidad: Number(this.tempIdHabilidad),
        nivelRequerido: this.tempNivel,
        esObligatorio: this.tempObligatorio,
        nombreHabilidad: nombreHab
      };

      this.nuevaOferta.habilidades.push(skill);


      this.tempIdTipoHabilidad = 0;
      this.listaHabilidadesFiltradas = [];
      this.tempIdHabilidad = 0;
      this.tempNivel = 'Básico';
      this.tempObligatorio = false;
    }
  }

  removerSkill(index: number) {
    this.nuevaOferta.habilidades.splice(index, 1);
  }


  validarFormulario(): boolean {
    const o = this.nuevaOferta;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!o.titulo || o.titulo.trim().length < 5) {
      this.ui.advertencia('⚠️ El título es demasiado corto (mínimo 5 caracteres).');
      return false;
    }

    if (o.experienciaMinima === null || o.experienciaMinima < 0) {
      this.ui.advertencia('⚠️ La experiencia mínima no puede ser negativa.');
      return false;
    }

    if (!o.cantidadVacantes || o.cantidadVacantes < 1) {
      this.ui.advertencia('⚠️ Debe haber al menos 1 vacante.');
      return false;
    }

    if (!this.tempIdProvincia || !o.idCiudad) {
      this.ui.advertencia('⚠️ Debe seleccionar la ubicación (Provincia y Ciudad).');
      return false;
    }

    if (o.salarioMin != null && o.salarioMax != null) {
      if (Number(o.salarioMin) > Number(o.salarioMax)) {
        this.ui.advertencia('⚠️ El salario mínimo no puede ser mayor al máximo.');
        return false;
      }
    }

    if (!o.descripcion || o.descripcion.trim().length < 15) {
      this.ui.advertencia('⚠️ La descripción de la oferta es muy corta (mínimo 15 caracteres).');
      return false;
    }

    if (!o.fechaCierre) {
      this.ui.advertencia('⚠️ La fecha de cierre es obligatoria.');
      return false;
    }

    const partesFecha = o.fechaCierre.split('-'); // ["2026", "03", "15"]
    const fechaC = new Date(Number(partesFecha[0]), Number(partesFecha[1]) - 1, Number(partesFecha[2]));
    fechaC.setHours(0, 0, 0, 0); // Forzar hora local

    if (fechaC.getTime() < hoy.getTime()) {
      this.ui.advertencia('⚠️ La fecha de cierre no puede ser anterior a hoy.');
      return false;
    }

    const limiteFuturo = new Date();
    limiteFuturo.setFullYear(hoy.getFullYear() + 1);
    if (fechaC.getTime() > limiteFuturo.getTime()) {
      this.ui.advertencia('⚠️ La fecha de cierre no puede exceder 1 año desde hoy.');
      return false;
    }


    if (!o.habilidades || o.habilidades.length === 0) {
      this.ui.advertencia('⚠️ Debe agregar al menos 1 habilidad técnica requerida para el puesto.');
      return false;
    }

    return true;
  }

  agregarRequisitoManual() {
    if (this.tempRequisitoManual.trim().length > 0) {
      this.nuevaOferta.requisitos_manuales.push({ descripcion: this.tempRequisitoManual.trim() });
      this.tempRequisitoManual = '';
    }
  }

  removerRequisitoManual(index: number) {
    this.nuevaOferta.requisitos_manuales.splice(index, 1);
  }

  guardar() {
    if (!this.validarFormulario()) {
      return;
    }
    this.guardando = true;
    this.ofertaService.crearOferta(this.nuevaOferta).subscribe({
      next: () => {
        this.ui.exito('¡Oferta guardada con éxito!');
        this.cerrarFormulario();
        this.cargarOfertas();
        this.guardando = false;
      },
      error: (err) => {
        if (err.status === 200 || err.status === 201) {
          this.ui.exito('¡Oferta guardada con éxito!');
          this.cerrarFormulario();
          this.cargarOfertas();
        } else {
          console.error("Detalle del error al guardar:", err);
          const mensajeReal = err.error?.error || err.error?.message || 'Error al guardar la oferta. Revisa la consola.';
          this.ui.error(`⚠️ ${mensajeReal}`);
          this.guardando = false;
        }
      }
    });
  }
}
