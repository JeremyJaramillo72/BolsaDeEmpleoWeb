import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OfertaService, OfertaDetalladaDTO } from '../../services/oferta.service';
import { UiNotificationService } from '../../services/ui-notification.service';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-mis-postulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-postulaciones.html',
  styleUrls: ['./mis-postulaciones.css']
})
export class MisPostulacionesComponent implements OnInit {

  postulaciones: OfertaDetalladaDTO[] = [];
  cargando: boolean = false;
  errorConexion: boolean = false;
  private idUsuario: number = 0;

  // Modal de validación
  mostrarModal: boolean = false;
  cargandoModal: boolean = false;
  perfilModal: any = null;
  tituloOfertaModal: string = '';

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService,
    private confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('idUsuario');
    if (idGuardado) {
      this.idUsuario = Number(idGuardado);
      this.cargarPostulaciones();
    } else {
      this.router.navigate(['/login']);
    }
  }

  cargarPostulaciones(): void {
    this.cargando = true;
    this.errorConexion = false;

    this.ofertaService.listarMisPostulaciones(this.idUsuario).subscribe({
      next: (data: any[]) => {
        this.cargando = false;
        if (!data || data.length === 0) {
          this.postulaciones = [];
          return;
        }
        this.postulaciones = data.map((o: any) => ({
          idOferta:            o.idOferta          ?? o.id_oferta,
          titulo:              o.titulo,
          descripcion:         o.descripcion,
          cantidadVacantes:    o.cantidadVacantes  ?? o.cantidad_vacantes,
          experienciaMinima:   o.experienciaMinima ?? o.experiencia_minima,
          fechaInicio:         o.fechaInicio       ?? o.fecha_inicio,
          fechaCierre:         o.fechaCierre       ?? o.fecha_cierre,
          nombreModalidad:     o.nombreModalidad   ?? o.nombre_modalidad,
          nombreJornada:       o.nombreJornada     ?? o.nombre_jornada,
          nombreCategoria:     o.nombreCategoria   ?? o.nombre_categoria,
          salarioMin:          o.salarioMin        ?? o.salario_min,
          salarioMax:          o.salarioMax        ?? o.salario_max,
          estadoOferta:        'aprobado',
          idFavoritas:         null,
          estadoFav:           null,
          idPostulacion:       o.idPostulacion     ?? o.id_postulacion,
          estadoValidacion:    o.estadoValidacion  ?? o.estado_validacion,
          observaciones:       o.observaciones     ?? null,
          esFavorito:          false,
          mostrarDetalles:     false,
          habilidades:         [],
          requisitos_manuales: [],
          nombreCiudad:        '',
          nombreEmpresa:       o.nombreEmpresa     ?? o.nombre_empresa ?? ''
        }));
        this.cdr.detectChanges();
        this.cargarInfoExtra();
      },
      error: (e: any) => {
        this.cargando = false;
        this.errorConexion = true;
        console.error('Error cargando postulaciones:', e);
      }
    });
  }

  cargarInfoExtra(): void {
    if (this.postulaciones.length === 0) return;
    const peticiones = this.postulaciones.map(p => this.ofertaService.obtenerExtraInfo(p.idOferta));
    forkJoin(peticiones).subscribe({
      next: (resultados: any[]) => {
        resultados.forEach((extra, i) => {
          if (extra) {
            this.postulaciones[i].nombreCiudad        = extra.nombreCiudad  ?? '';
            this.postulaciones[i].nombreEmpresa       = extra.nombreEmpresa ?? '';
            this.postulaciones[i].habilidades         = extra.habilidades   ?? [];
            this.postulaciones[i].requisitos_manuales = extra.requisitos    ?? [];
          }
        });
        this.cdr.detectChanges();
      },
      error: (e: any) => console.error('Error al cargar info extra:', e)
    });
  }

  getEstadoBadgeClass(estado: string | null | undefined): string {
    switch (estado?.toLowerCase()) {
      case 'aceptado':
      case 'aprobado':   return 'badge-aprobado';
      case 'rechazado':  return 'badge-rechazado';
      case 'pendiente':  return 'badge-pendiente';
      default:           return 'badge-pendiente';
    }
  }

  getEstadoItemClass(estado: string | null | undefined): string {
    switch (estado?.toLowerCase()) {
      case 'aceptado':
      case 'aprobado':  return 'item-aprobado';
      case 'rechazado': return 'item-rechazado';
      default:          return 'item-pendiente';
    }
  }

  getEstadoItemIcon(estado: string | null | undefined): string {
    switch (estado?.toLowerCase()) {
      case 'aceptado':  return 'check_circle';
      case 'rechazado': return 'cancel';
      default:          return 'hourglass_empty';
    }
  }

  tieneExcluyentes(habilidades: any[]): boolean {
    return habilidades?.some(h => h.esObligatorio) ?? false;
  }

  // ── Modal de validación ─────────────────────────────────────────────────

  verValidacion(postulacion: OfertaDetalladaDTO): void {
    if (!postulacion.idPostulacion) return;
    this.tituloOfertaModal = postulacion.titulo ?? '';
    this.perfilModal = null;
    this.mostrarModal = true;
    this.cargandoModal = true;

    console.log('▶ Llamando resumen con idPostulacion:', postulacion.idPostulacion);

    this.ofertaService.obtenerPerfilPostulante(postulacion.idPostulacion).subscribe({
      next: (data: any) => {
        console.log('✅ Respuesta resumen raw:', data);
        console.log('   formacionAcademica raw:', data.formacionAcademica);
        console.log('   experienciaLaboral raw:', data.experienciaLaboral);
        console.log('   cursosRealizados raw:',   data.cursosRealizados);
        console.log('   idiomas raw:',             data.idiomas);

        const parsear = (v: any) => {
          if (!v) return [];
          if (typeof v === 'string') { try { return JSON.parse(v); } catch (err) { console.error('parse error:', err, v); return []; } }
          return Array.isArray(v) ? v : [];
        };
        this.perfilModal = {
          ...data,
          formacionAcademica: parsear(data.formacionAcademica),
          experienciaLaboral: parsear(data.experienciaLaboral),
          cursosRealizados:   parsear(data.cursosRealizados),
          idiomas:            parsear(data.idiomas)
        };
        console.log('   formacionAcademica parsed:', this.perfilModal.formacionAcademica);
        this.cargandoModal = false;
        this.cdr.detectChanges();
      },
      error: (e: any) => {
        this.cargandoModal = false;
        console.error('❌ Error al obtener resumen:', e.status, e.message, e.error);
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.perfilModal = null;
  }

  abrirDocumento(url: string): void {
    if (url) window.open(url, '_blank');
  }

  // ── Cancelar postulación ────────────────────────────────────────────────

  cancelarPostulacion(postulacion: OfertaDetalladaDTO): void {
    const id = postulacion.idPostulacion;
    if (!id) return;
    this.confirmService.abrir(`¿Está seguro de cancelar la postulación para "${postulacion.titulo}"?`).then(acepto => {
      if (!acepto) return;
      this.ofertaService.cancelarPostulacion(id).subscribe({
        next: () => {
          this.ui.exito('Postulación cancelada exitosamente');
          this.cargarPostulaciones();
        },
        error: (error) => {
          console.error('Error al cancelar postulación:', error);
          this.ui.error('Error al cancelar la postulación');
        }
      });
    });
  }
}
