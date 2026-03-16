import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OfertaService, OfertaDetalladaDTO, JSearchOfertaDTO, FavoritaGuardadaDTO } from '../../services/oferta.service';
import { UiNotificationService } from '../../services/ui-notification.service';
@Component({
  selector: 'app-busqueda-empleo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './busqueda-empleo.html',
  styleUrls: ['./busqueda-empleo.css']
})
export class BusquedaEmpleoComponent implements OnInit {

  ofertas: OfertaDetalladaDTO[] = [];
  ofertasExternas: OfertaDetalladaDTO[] = [];
  modalidades: string[] = [];
  jornadas: string[] = [];
  categorias: string[] = [];

  modoBusqueda: 'internas' | 'externas' = 'internas';
  paginaExternaActual: number = 1;
  readonly totalPaginasExternas: number = 3;
  queryExterna: string = 'developer jobs in chicago';
  countryExterna: string = 'us';
  datePostedExterna: string = 'all';
  languageExterna: string = '';
  workFromHomeExterna: boolean = false;

  filtroTitulo: string = '';
  filtroModalidad: string = '';
  filtroJornada: string = '';
  filtroCategoria: string = '';
  filtroFecha: string = 'reciente';

  mostrarModalPostulacion: boolean = false;
  ofertaSeleccionada: OfertaDetalladaDTO | null = null;
  archivoSeleccionado: File | null = null;
  isDragOver: boolean = false;
  subiendoPostulacion: boolean = false;
  errorConexion: boolean = false;
  cargando: boolean = false;
  soloFavoritas: boolean = false;
  filtroTipoFavoritas: 'todas' | 'internas' | 'externas' = 'todas';
  favoritasMixtas: OfertaDetalladaDTO[] = [];
  cargandoFavoritas: boolean = false;
  errorPostulacion: string | null = null;
  errorBusquedaExterna: string | null = null;
  private idUsuario: number = 0;
  private jsearchPorExternalId = new Map<string, JSearchOfertaDTO>();

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService
  ) {}

  ngOnInit(): void {
    console.log('=== localStorage completo ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`  ${key}: ${localStorage.getItem(key!)}`);
    }

    const idGuardado = localStorage.getItem('idUsuario');
    console.log('idUsuario encontrado:', idGuardado);

    if (idGuardado) {
      this.idUsuario = Number(idGuardado);
      console.log('idUsuario como número:', this.idUsuario);
      this.cargarOfertas();
    } else {
      console.warn('No se encontró idUsuario en localStorage, redirigiendo...');
      this.router.navigate(['/login']);
    }
  }

  cargarOfertas(): void {
    this.cargando = true;
    this.errorConexion = false;

    this.ofertaService.listarOfertasCompleto(this.idUsuario).subscribe({
      next: (data: any[]) => {
        this.cargando = false;

        if (!data || data.length === 0) return;

        this.ofertas = data.map((o: any) => ({
          idOferta:          o.idOferta          ?? o.id_oferta,
          titulo:            o.titulo,
          descripcion:       o.descripcion,
          cantidadVacantes:  o.cantidadVacantes  ?? o.cantidad_vacantes,
          experienciaMinima: o.experienciaMinima ?? o.experiencia_minima,
          fechaInicio:       o.fechaInicio       ?? o.fecha_inicio,
          fechaCierre:       o.fechaCierre       ?? o.fecha_cierre,
          nombreModalidad:   o.nombreModalidad   ?? o.nombre_modalidad,
          nombreJornada:     o.nombreJornada     ?? o.nombre_jornada,
          nombreCategoria:   o.nombreCategoria   ?? o.nombre_categoria,
          salarioMin:        o.salarioMin        ?? o.salario_min,
          salarioMax:        o.salarioMax        ?? o.salario_max,
          estadoOferta:      o.estadoOferta      ?? o.estado_oferta,
          idFavoritas:       o.idFavoritas       ?? o.id_favoritas,
          estadoFav:         o.estadoFav         ?? o.estado_fav,
          idPostulacion:     o.idPostulacion     ?? o.id_postulacion,
          estadoValidacion:  o.estadoValidacion  ?? o.estado_validacion,
          esFavorito:       (o.idFavoritas ?? o.id_favoritas) != null,
          mostrarDetalles:  false,
          habilidades:      [],
          requisitos_manuales: [],
          nombreCiudad:     '',
          nombreEmpresa:    o.nombreEmpresa     ?? o.nombre_empresa ?? ''
        }));

        this.modalidades = [...new Set(this.ofertas.map(o => o.nombreModalidad).filter(Boolean))] as string[];
        this.jornadas    = [...new Set(this.ofertas.map(o => o.nombreJornada).filter(Boolean))] as string[];
        this.categorias  = [...new Set(this.ofertas.map(o => o.nombreCategoria).filter(Boolean))] as string[];

        this.cdr.detectChanges();
        this.cargarInfoExtra();
        if (this.soloFavoritas) this.cargarFavoritasMixtas();
      },
      error: (e: any) => {
        this.cargando = false;
        this.errorConexion = true;
        console.error('❌ Error HTTP:', e.status, e.message);
      }
    });
  }

  cambiarModo(modo: 'internas' | 'externas'): void {
    if (this.modoBusqueda === modo) return;
    this.modoBusqueda = modo;
    this.errorConexion = false;

    if (modo === 'externas' && this.ofertasExternas.length === 0) {
      this.buscarOfertasExternas(1);
    }
  }

  buscarOfertasExternas(page: number = 1): void {
    const query = this.queryExterna.trim();
    if (!query) {
      this.errorBusquedaExterna = 'Debe ingresar un criterio de busqueda para JSearch.';
      this.ofertasExternas = [];
      return;
    }

    this.cargando = true;
    this.errorConexion = false;
    this.errorBusquedaExterna = null;

    this.ofertaService.buscarOfertasExternas(
      query,
      page,
      this.countryExterna,
      this.datePostedExterna,
      this.languageExterna,
      this.workFromHomeExterna
    ).subscribe({
      next: (res) => {
        this.cargando = false;
        this.paginaExternaActual = page;
        this.jsearchPorExternalId.clear();
        this.ofertasExternas = (res.data ?? []).map((job, idx) => {
          if (job.jobId) {
            this.jsearchPorExternalId.set(job.jobId, job);
          }
          return this.mapearOfertaExterna(job, idx, page);
        });
        this.marcarFavoritasExternas();
      },
      error: (e: any) => {
        this.cargando = false;
        this.errorConexion = true;
        this.errorBusquedaExterna = e?.error || 'No se pudo consultar JSearch en este momento.';
        this.ofertasExternas = [];
      }
    });
  }

  private mapearOfertaExterna(job: JSearchOfertaDTO, index: number, page: number): OfertaDetalladaDTO {
    const fecha = job.jobPostedAt && job.jobPostedAt.trim() ? job.jobPostedAt : new Date().toISOString();
    const ciudad = [job.jobCity, job.jobState, job.jobCountry].filter(Boolean).join(', ');
    const idTemporal = (page * 100 + index + 1) * -1;

    return {
      idOferta: idTemporal,
      externalOfferId: job.jobId || '',
      titulo: job.jobTitle || 'Oferta externa',
      descripcion: job.jobDescription || 'Sin descripcion disponible',
      cantidadVacantes: 0,
      experienciaMinima: 0,
      fechaInicio: fecha,
      fechaCierre: fecha,
      nombreModalidad: job.jobIsRemote ? 'Remoto' : 'No especificado',
      nombreJornada: job.jobEmploymentType || 'No especificado',
      nombreCategoria: 'Externa',
      salarioMin: 0,
      salarioMax: 0,
      estadoOferta: 'externa',
      idFavoritas: null,
      estadoFav: null,
      idPostulacion: null,
      estadoValidacion: null,
      habilidades: [],
      requisitos_manuales: [],
      esFavorito: false,
      mostrarDetalles: false,
      nombreCiudad: ciudad,
      nombreEmpresa: job.employerName || '',
      esExterna: true,
      urlOfertaExterna: job.jobApplyLink || job.jobGoogleLink || ''
    };
  }

  irPaginaExterna(page: number): void {
    if (page < 1 || page > this.totalPaginasExternas || page === this.paginaExternaActual) return;
    this.buscarOfertasExternas(page);
  }

  paginaExternaAnterior(): void {
    this.irPaginaExterna(this.paginaExternaActual - 1);
  }

  paginaExternaSiguiente(): void {
    this.irPaginaExterna(this.paginaExternaActual + 1);
  }

  abrirOfertaExterna(oferta: OfertaDetalladaDTO): void {
    if (!oferta.urlOfertaExterna) return;
    window.open(oferta.urlOfertaExterna, '_blank');
  }

  get paginasExternas(): number[] {
    return [1, 2, 3];
  }

  get ofertasVisibles(): OfertaDetalladaDTO[] {
    if (this.soloFavoritas) return this.favoritasFiltradas;
    return this.modoBusqueda === 'internas' ? this.ofertasFiltradas : this.ofertasExternas;
  }

  get favoritasFiltradas(): OfertaDetalladaDTO[] {
    if (this.filtroTipoFavoritas === 'internas') return this.favoritasMixtas.filter(o => !o.esExterna);
    if (this.filtroTipoFavoritas === 'externas') return this.favoritasMixtas.filter(o => !!o.esExterna);
    return this.favoritasMixtas;
  }

  cargarInfoExtra(): void {
    if (this.ofertas.length === 0) return;

    console.log('🔍 Cargando info extra para', this.ofertas.length, 'ofertas');

    const peticiones = this.ofertas.map(o =>
      this.ofertaService.obtenerExtraInfo(o.idOferta)
    );

    forkJoin(peticiones).subscribe({
      next: (resultados: any[]) => {
        console.log('✅ Info extra recibida:', resultados);
        resultados.forEach((extra, i) => {
          if (extra) {
            console.log(`📦 Oferta ${i} (ID: ${this.ofertas[i].idOferta}):`, {
              ciudad: extra.nombreCiudad,
              habilidades: extra.habilidades?.length ?? 0,
              requisitos: extra.requisitos?.length ?? 0
            });
            this.ofertas[i].nombreCiudad        = extra.nombreCiudad  ?? '';
            this.ofertas[i].nombreEmpresa       = extra.nombreEmpresa ?? '';
            this.ofertas[i].habilidades         = extra.habilidades   ?? [];
            this.ofertas[i].requisitos_manuales = extra.requisitos    ?? [];
          }
        });
        this.cdr.detectChanges();
        if (this.soloFavoritas) this.cargarFavoritasMixtas();
      },
      error: (e: any) => console.error('Error al cargar info extra:', e)
    });
  }

  get ofertasFiltradas(): OfertaDetalladaDTO[] {
    let resultado = this.ofertas.filter(o =>
      o.estadoOferta?.toLowerCase() === 'aprobado'
    );

    // Filtro de favoritas
    if (this.soloFavoritas) {
      resultado = resultado.filter(o => o.esFavorito);
    }

    if (this.filtroTitulo.trim()) {
      resultado = resultado.filter(o =>
        o.titulo.toLowerCase().includes(this.filtroTitulo.toLowerCase())
      );
    }
    if (this.filtroModalidad) {
      resultado = resultado.filter(o => o.nombreModalidad === this.filtroModalidad);
    }
    if (this.filtroJornada) {
      resultado = resultado.filter(o => o.nombreJornada === this.filtroJornada);
    }
    if (this.filtroCategoria) {
      resultado = resultado.filter(o => o.nombreCategoria === this.filtroCategoria);
    }

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaInicio).getTime();
      const fechaB = new Date(b.fechaInicio).getTime();
      return this.filtroFecha === 'reciente' ? fechaB - fechaA : fechaA - fechaB;
    });

    return resultado;
  }

  toggleVerFavoritas(): void {
    this.soloFavoritas = !this.soloFavoritas;
    if (this.soloFavoritas) this.cargarFavoritasMixtas();
  }

  get totalFavoritas(): number {
    if (this.favoritasMixtas.length > 0) return this.favoritasMixtas.length;
    return this.ofertas.filter(o => o.esFavorito).length + this.ofertasExternas.filter(o => o.esFavorito).length;
  }

  cambiarFiltroFavoritas(tipo: 'todas' | 'internas' | 'externas'): void {
    this.filtroTipoFavoritas = tipo;
  }

  private cargarFavoritasMixtas(): void {
    this.cargandoFavoritas = true;
    this.ofertaService.obtenerFavoritasUsuario(this.idUsuario).subscribe({
      next: (lista: FavoritaGuardadaDTO[]) => {
        this.favoritasMixtas = (lista ?? []).map(f => {
          const esExterna = (f.origenOferta ?? '').toLowerCase() === 'externa';
          if (!esExterna) {
            const ofertaInterna = this.ofertas.find(o => o.idOferta === f.idOferta);
            if (ofertaInterna) {
              return {
                ...ofertaInterna,
                idFavoritas: f.idFavoritas,
                estadoFav: f.estadoFav,
                esFavorito: true,
                mostrarDetalles: false,
                esExterna: false
              } as OfertaDetalladaDTO;
            }
          }

          const fecha = new Date().toISOString();
          return {
            idOferta: f.idOferta,
            externalOfferId: f.idOrigenExterna ?? '',
            titulo: f.titulo ?? 'Oferta guardada',
            descripcion: f.descripcion ?? '',
            cantidadVacantes: 0,
            experienciaMinima: 0,
            fechaInicio: (f.fechaInicio as string) ?? fecha,
            fechaCierre: (f.fechaCierre as string) ?? fecha,
            nombreModalidad: esExterna ? 'Externa' : 'No especificado',
            nombreJornada: esExterna ? 'No especificado' : '',
            nombreCategoria: esExterna ? 'Externa' : 'Interna',
            salarioMin: (f.salarioMin as number) ?? 0,
            salarioMax: (f.salarioMax as number) ?? 0,
            estadoOferta: esExterna ? 'externa' : 'aprobado',
            idFavoritas: f.idFavoritas,
            estadoFav: f.estadoFav,
            idPostulacion: null,
            estadoValidacion: null,
            habilidades: [],
            requisitos_manuales: [],
            esFavorito: true,
            mostrarDetalles: false,
            nombreCiudad: f.nombreCiudad ?? '',
            nombreEmpresa: f.nombreEmpresa ?? '',
            esExterna,
            urlOfertaExterna: f.urlAplicar ?? ''
          } as OfertaDetalladaDTO;
        });
        this.cargandoFavoritas = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoFavoritas = false;
        this.favoritasMixtas = [];
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFiltros(): void {
    if (this.soloFavoritas) {
      this.filtroTipoFavoritas = 'todas';
      return;
    }

    if (this.modoBusqueda === 'internas') {
      this.filtroTitulo = '';
      this.filtroModalidad = '';
      this.filtroJornada = '';
      this.filtroCategoria = '';
      this.filtroFecha = 'reciente';
      this.soloFavoritas = false;
      return;
    }

    this.queryExterna = '';
    this.countryExterna = 'us';
    this.datePostedExterna = 'all';
    this.languageExterna = '';
    this.workFromHomeExterna = false;
    this.paginaExternaActual = 1;
    this.ofertasExternas = [];
    this.errorBusquedaExterna = null;
  }

  toggleFavorito(oferta: OfertaDetalladaDTO): void {
    if (oferta.esExterna) {
      const job = oferta.externalOfferId ? this.jsearchPorExternalId.get(oferta.externalOfferId) : undefined;
      const payload: JSearchOfertaDTO = job ?? {
        jobId: oferta.externalOfferId ?? '',
        jobTitle: oferta.titulo ?? '',
        employerName: oferta.nombreEmpresa ?? '',
        jobEmploymentType: oferta.nombreJornada ?? '',
        jobCity: oferta.nombreCiudad ?? '',
        jobState: '',
        jobCountry: '',
        jobDescription: oferta.descripcion ?? '',
        jobPostedAt: oferta.fechaInicio ?? '',
        jobApplyLink: oferta.urlOfertaExterna ?? '',
        jobGoogleLink: '',
        jobIsRemote: (oferta.nombreModalidad ?? '').toLowerCase().includes('remoto')
      };
      if (!payload.jobId) return;

      this.ofertaService.toggleFavoritaExterna(payload, this.idUsuario).subscribe({
        next: () => {
          oferta.esFavorito = !oferta.esFavorito;
          if (this.soloFavoritas) {
            this.cargarFavoritasMixtas();
          } else {
            this.marcarFavoritasExternas();
          }
          this.cdr.detectChanges();
        },
        error: (e: any) => console.error('Error toggle favorita externa:', e)
      });
      return;
    }

    if (!oferta.idOferta) return;

    this.ofertaService.toggleFavorita(oferta.idOferta, this.idUsuario).subscribe({
      next: (res: any) => {
        try {
          const json = typeof res === 'string' ? JSON.parse(res) : res;
          if (json.success) {
            oferta.esFavorito = !oferta.esFavorito;
            if (this.soloFavoritas) this.cargarFavoritasMixtas();
            this.cdr.detectChanges();

          } else {
            console.error('Error en toggle favorita:', json.mensaje);
          }
        } catch (e) {
          oferta.esFavorito = !oferta.esFavorito;
        }
      },

      error: (e: any) => console.error('Error toggle favorita:', e)
    });

  }

  private marcarFavoritasExternas(): void {
    if (this.ofertasExternas.length === 0) {
      this.cdr.detectChanges();
      return;
    }

    this.ofertaService.obtenerFavoritasExternas(this.idUsuario).subscribe({
      next: (ids: string[]) => {
        const favoritas = new Set((ids ?? []).filter(Boolean));
        this.ofertasExternas.forEach(oferta => {
          oferta.esFavorito = !!oferta.externalOfferId && favoritas.has(oferta.externalOfferId);
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.ofertasExternas.forEach(oferta => oferta.esFavorito = false);
        this.cdr.detectChanges();
      }
    });
  }

  yaPostulo(oferta: OfertaDetalladaDTO): boolean {
    if (oferta.idPostulacion == null) return false;
    const estado = oferta.estadoValidacion?.toLowerCase() ?? 'pendiente';
    return estado === 'pendiente' || estado === 'aceptado';
  }

  puedePostular(oferta: OfertaDetalladaDTO): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio  = oferta.fechaInicio  ? new Date(oferta.fechaInicio)  : null;
    const cierre  = oferta.fechaCierre  ? new Date(oferta.fechaCierre)  : null;
    if (inicio) inicio.setHours(0, 0, 0, 0);
    if (cierre) cierre.setHours(0, 0, 0, 0);
    if (inicio && hoy < inicio) return false;
    if (cierre && hoy > cierre) return false;
    return true;
  }

  mensajeFecha(oferta: OfertaDetalladaDTO): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = oferta.fechaInicio ? new Date(oferta.fechaInicio) : null;
    const cierre = oferta.fechaCierre ? new Date(oferta.fechaCierre) : null;
    if (inicio) inicio.setHours(0, 0, 0, 0);
    if (cierre) cierre.setHours(0, 0, 0, 0);
    if (inicio && hoy < inicio) return 'Aún no disponible';
    if (cierre && hoy > cierre) return 'Convocatoria cerrada';
    return '';
  }

  abrirModalPostulacion(oferta: OfertaDetalladaDTO): void {
    this.ofertaSeleccionada = oferta;
    this.archivoSeleccionado = null;
    this.mostrarModalPostulacion = true;

    this.errorPostulacion = null;
    this.subiendoPostulacion = false;
  }

  cerrarModalPostulacion(): void {
    if (this.subiendoPostulacion) return;

    this.mostrarModalPostulacion = false;
    this.ofertaSeleccionada = null;
    this.archivoSeleccionado = null;
    this.isDragOver = false;
    this.errorPostulacion = null;
  }
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  reintentarPostulacion(): void {
    this.errorPostulacion = null;
    this.archivoSeleccionado = null;
  }

  private validarArchivo(file: File): boolean {
    if (file.type !== 'application/pdf') {
      this.ui.error('Solo se permiten archivos PDF.');
      return false;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.ui.error(`El archivo excede el límite de 10 MB (tamaño: ${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return false;
    }
    return true;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.validarArchivo(file)) {
        this.archivoSeleccionado = file;
      } else {
        input.value = '';
        this.archivoSeleccionado = null;
      }
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (this.validarArchivo(file)) {
        this.archivoSeleccionado = file;
      }
    }
  }

  enviarPostulacion(): void {
    if (!this.ofertaSeleccionada) return;

    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
      this.ui.advertencia('Debe iniciar sesión para postular');
      return;
    }

    this.errorPostulacion = null;
    this.subiendoPostulacion = true;
    this.cdr.detectChanges();

    this.ofertaService.postular(Number(idUsuario), this.ofertaSeleccionada.idOferta, this.archivoSeleccionado)
      .subscribe({
        next: (response) => {
          this.subiendoPostulacion = false;
          this.cdr.detectChanges();

          this.ui.exito('¡Postulación enviada exitosamente!');
          this.cerrarModalPostulacion();
          this.cargarOfertas();
        },
        error: (error) => {
          this.subiendoPostulacion = false;

          let mensajeRechazo = 'Error al enviar la postulación. Por favor intente nuevamente.';
          if (error.error && error.error.error) {
            mensajeRechazo = error.error.error;
          }

          this.errorPostulacion = mensajeRechazo;
          this.cdr.detectChanges();
        }
      });
  }

  tieneExcluyentes(habilidades: any[]): boolean {
    return habilidades.some(h => h.esObligatorio);
  }
}
