import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OfertaService, OfertaDetalladaDTO } from '../../services/oferta.service';
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
  modalidades: string[] = [];
  jornadas: string[] = [];
  categorias: string[] = [];

  filtroTitulo: string = '';
  filtroModalidad: string = '';
  filtroJornada: string = '';
  filtroCategoria: string = '';
  filtroFecha: string = 'reciente';

  mostrarModalPostulacion: boolean = false;
  ofertaSeleccionada: OfertaDetalladaDTO | null = null;
  archivoSeleccionado: File | null = null;
  isDragOver: boolean = false;
  errorConexion: boolean = false;
  cargando: boolean = false;
  soloFavoritas: boolean = false;

  // TODO: obtener idUsuario desde el servicio de autenticación
  private idUsuario: number = 0;

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService
  ) {}

  ngOnInit(): void {
    // Verificar TODAS las keys del localStorage
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
      },
      error: (e: any) => {
        this.cargando = false;
        this.errorConexion = true;
        console.error('❌ Error HTTP:', e.status, e.message);
      }
    });
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
  }

  get totalFavoritas(): number {
    return this.ofertas.filter(o => o.esFavorito).length;
  }

  limpiarFiltros(): void {
    this.filtroTitulo = '';
    this.filtroModalidad = '';
    this.filtroJornada = '';
    this.filtroCategoria = '';
    this.filtroFecha = 'reciente';
    this.soloFavoritas = false;
  }

  toggleFavorito(oferta: OfertaDetalladaDTO): void {
    if (!oferta.idOferta) return;

    this.ofertaService.toggleFavorita(oferta.idOferta, this.idUsuario).subscribe({
      next: (res: any) => {
        try {
          const json = typeof res === 'string' ? JSON.parse(res) : res;
          if (json.success) {
            oferta.esFavorito = !oferta.esFavorito;
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
  }

  cerrarModalPostulacion(): void {
    this.mostrarModalPostulacion = false;
    this.ofertaSeleccionada = null;
    this.archivoSeleccionado = null;
    this.isDragOver = false;
  }

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
    if (!this.ofertaSeleccionada) {
      console.warn('⚠️ No hay oferta seleccionada');
      return;
    }

    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
      this.ui.advertencia('Debe iniciar sesión para postular');
      return;
    }

    console.log('📤 Enviando postulación:', {
      idUsuario: Number(idUsuario),
      idOferta: this.ofertaSeleccionada.idOferta,
      tieneArchivo: !!this.archivoSeleccionado,
      nombreArchivo: this.archivoSeleccionado?.name
    });

    this.ofertaService.postular(
      Number(idUsuario),
      this.ofertaSeleccionada.idOferta,
      this.archivoSeleccionado
    ).subscribe({
      next: (response) => {
        this.ui.exito('¡Postulación enviada exitosamente!');
        console.log('✅ Postulación exitosa:', response);
        this.cerrarModalPostulacion();
        // Recargar ofertas para actualizar el estado
        this.cargarOfertas();
      },
      error: (error) => {
        console.error('Error al postular:', error);
        this.ui.error('Error al enviar la postulación. Por favor intente nuevamente.');
        console.error('❌ Error al postular:', error);
        alert('Error al enviar la postulación. Por favor intente nuevamente.');
      }
    });
  }

  tieneExcluyentes(habilidades: any[]): boolean {
    return habilidades.some(h => h.esObligatorio);
  }
}
