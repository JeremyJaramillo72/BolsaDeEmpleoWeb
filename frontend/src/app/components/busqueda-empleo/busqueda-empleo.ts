import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfertaService, OfertaDetalladaDTO } from '../../services/oferta.service';

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
    private cdr: ChangeDetectorRef
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
    const url = `http://localhost:8080/api/ofertas/completo/${this.idUsuario}`;
    console.log('Llamando al endpoint:', url);

    this.ofertaService.listarOfertasCompleto(this.idUsuario).subscribe({
      next: (data: any[]) => {
        console.log('✅ Respuesta recibida, total registros:', data?.length);
        console.log('Raw data:', data);

        if (!data || data.length === 0) {
          console.warn('⚠️ El backend retornó un array vacío');
          return;
        }

        console.log('Keys del primer registro:', Object.keys(data[0]));
        console.log('Primer registro completo:', JSON.stringify(data[0]));

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
          esFavorito:       (o.idFavoritas ?? o.id_favoritas) != null
        }));

        console.log('Ofertas mapeadas:', this.ofertas.length);
        console.log('Estados únicos:', [...new Set(this.ofertas.map(o => o.estadoOferta))]);

        this.modalidades = [...new Set(this.ofertas.map(o => o.nombreModalidad).filter(Boolean))] as string[];
        this.jornadas    = [...new Set(this.ofertas.map(o => o.nombreJornada).filter(Boolean))] as string[];
        this.categorias  = [...new Set(this.ofertas.map(o => o.nombreCategoria).filter(Boolean))] as string[];
        this.cdr.detectChanges();
      },
      error: (e: any) => {
        console.error('❌ Error HTTP:', e.status, e.statusText);
        console.error('URL:', e.url);
        console.error('Mensaje:', e.message);
        console.error('Error completo:', e);
      }
    });
  }

  get ofertasFiltradas(): OfertaDetalladaDTO[] {
    let resultado = this.ofertas.filter(o =>
      o.estadoOferta?.toLowerCase() === 'activa'
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
          } else {
            console.error('Error en toggle favorita:', json.mensaje);
          }
        } catch (e) {
          oferta.esFavorito = !oferta.esFavorito;
        }
      },

      error: (e: any) => console.error('Error toggle favorita:', e)
    });
    this.cdr.detectChanges();
  }

  yaPostulo(oferta: OfertaDetalladaDTO): boolean {
    return oferta.idPostulacion != null;
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.archivoSeleccionado = input.files[0];
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
    if (files?.length && files[0].type === 'application/pdf') {
      this.archivoSeleccionado = files[0];
    }
  }

  enviarPostulacion(): void {
    if (!this.ofertaSeleccionada) return;

    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
      alert('Debe iniciar sesión para postular');
      return;
    }

    this.ofertaService.postular(
      Number(idUsuario),
      this.ofertaSeleccionada.idOferta,
      this.archivoSeleccionado
    ).subscribe({
      next: (response) => {
        alert('¡Postulación enviada exitosamente!');
        this.cerrarModalPostulacion();
        // Recargar ofertas para actualizar el estado
        this.cargarOfertas();
      },
      error: (error) => {
        console.error('Error al postular:', error);
        alert('Error al enviar la postulación. Por favor intente nuevamente.');
      }
    });
  }
}
