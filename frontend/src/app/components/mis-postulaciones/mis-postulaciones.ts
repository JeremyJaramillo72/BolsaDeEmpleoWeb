import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfertaService, OfertaDetalladaDTO } from '../../services/oferta.service';

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

  constructor(
    private ofertaService: OfertaService,
    private router: Router,
    private cdr: ChangeDetectorRef
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

    this.ofertaService.listarOfertasCompleto(this.idUsuario).subscribe({
      next: (data: any[]) => {
        this.cargando = false;
        // Filtrar solo las que tienen postulación y NO están canceladas
        this.postulaciones = data
          .filter((o: any) => {
            const tienePostulacion = (o.idPostulacion ?? o.id_postulacion) != null;
            const estado = (o.estadoValidacion ?? o.estado_validacion)?.toLowerCase();
            const noCancelada = estado !== 'cancelada';
            return tienePostulacion && noCancelada;
          })
          .map((o: any) => ({
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
      },
      error: (e: any) => {
        this.cargando = false;
        this.errorConexion = true;
        console.error('Error cargando postulaciones:', e);
      }
    });
  }

  getEstadoBadgeClass(estado: string | null | undefined): string {
    switch (estado?.toLowerCase()) {
      case 'aprobado':   return 'badge-aprobado';
      case 'rechazado':  return 'badge-rechazado';
      case 'pendiente':  return 'badge-pendiente';
      default:           return 'badge-pendiente';
    }
  }

  verDocumento(postulacion: OfertaDetalladaDTO): void {
    if (!postulacion.idPostulacion) {
      alert('No se encontró el ID de postulación');
      return;
    }

    this.ofertaService.obtenerArchivoCV(postulacion.idPostulacion).subscribe({
      next: (response) => {
        if (response.url) {
          // Abrir el archivo en una nueva ventana
          window.open(response.url, '_blank');
        } else {
          alert('No se encontró archivo adjunto para esta postulación');
        }
      },
      error: (error) => {
        console.error('Error al obtener archivo:', error);
        alert('No se pudo recuperar el archivo');
      }
    });
  }

  cancelarPostulacion(postulacion: OfertaDetalladaDTO): void {
    if (!postulacion.idPostulacion) {
      alert('No se encontró el ID de postulación');
      return;
    }

    if (!confirm(`¿Está seguro de cancelar la postulación para "${postulacion.titulo}"?`)) {
      return;
    }

    this.ofertaService.cancelarPostulacion(postulacion.idPostulacion).subscribe({
      next: (response) => {
        alert('Postulación cancelada exitosamente');
        // Recargar postulaciones para actualizar el estado
        this.cargarPostulaciones();
      },
      error: (error) => {
        console.error('Error al cancelar postulación:', error);
        alert('Error al cancelar la postulación');
      }
    });
  }
}
