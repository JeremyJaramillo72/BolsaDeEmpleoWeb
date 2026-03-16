import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

// 1. Interfaz para la tabla principal (Resumen de postulantes)
export interface AuditoriaPostulante {
  idUsuario: number;
  idPerfilAcademico: number;
  nombrePostulante: string;
  correo: string;
  ultimaModificacion: string;
  totalMovimientos: number;
}

// 2. Interfaz para la línea de tiempo y los modales (Detalle)
export interface TrazabilidadPostulante {
  idHistorial: number;
  seccion: string; // Ej: EXP_LABORAL, IDIOMAS, etc.
  accion: string;
  fechaHora: string;
  ejecutor: string;
  camposModificados: string;
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
}

@Component({
  selector: 'app-postulantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postulantes.html',
  styleUrls: ['./postulantes.css'] // 👈 Asegúrate de pegar aquí el mismo CSS de ofertas
})
export class PostulantesComponent implements OnInit {
  postulantesList: AuditoriaPostulante[] = [];
  postulantesFiltrados: AuditoriaPostulante[] = [];
  cargandoPostulantes = false;
  mensajeError = '';

  filtroBusqueda = '';
  paginaActual = 1;
  itemsPorPagina = 10;

  // Variables para la Trazabilidad (Timeline)
  mostrarModalHistorial = false;
  cargandoHistorial = false;
  postulanteSeleccionado: AuditoriaPostulante | null = null;
  listaHistorial: TrazabilidadPostulante[] = [];

  // Variables para los Modales Premium (Detalles de los JSON)
  mostrarModalDetalles = false;
  trazabilidadSeleccionada: TrazabilidadPostulante | null = null;
  tipoModalDetalle: 'INSERT' | 'UPDATE' | 'DELETE' = 'UPDATE';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarPostulantes();
  }

  cargarPostulantes(): void {
    this.cargandoPostulantes = true;
    // NOTA: Tendrás que crear este método en tu adminService
    this.adminService.getPostulantesAuditoria().subscribe({
      next: (data: AuditoriaPostulante[]) => {
        this.postulantesList = data;
        this.aplicarFiltros();
        this.cargandoPostulantes = false;
      },
      error: (err) => {
        console.error('Error al cargar historial de postulantes:', err);
        this.mensajeError = 'Error al cargar los registros.';
        this.cargandoPostulantes = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.postulantesList];
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        (p.nombrePostulante && p.nombrePostulante.toLowerCase().includes(busqueda)) ||
        (p.correo && p.correo.toLowerCase().includes(busqueda))
      );
    }
    this.postulantesFiltrados = resultado;
    this.paginaActual = 1;
  }

  get postulantesPaginados(): AuditoriaPostulante[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    return this.postulantesFiltrados.slice(inicio, inicio + this.itemsPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.postulantesFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) this.paginaActual = pagina;
  }

  verHistorial(postulante: AuditoriaPostulante): void {
    this.postulanteSeleccionado = postulante;
    this.mostrarModalHistorial = true;
    this.cargandoHistorial = true;
    // NOTA: Tendrás que crear este método en tu adminService, enviando el idPerfilAcademico
    this.adminService.getHistorialByPerfil(postulante.idPerfilAcademico).subscribe({
      next: (data: TrazabilidadPostulante[]) => {
        this.listaHistorial = data;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar la línea de tiempo:', err);
        this.mensajeError = 'Error al cargar el historial.';
        this.cargandoHistorial = false;
      }
    });
  }

  cerrarModalHistorial(): void {
    this.mostrarModalHistorial = false;
    this.postulanteSeleccionado = null;
    this.listaHistorial = [];
  }

  // ✅ LÓGICA DE LOS MODALES DE COLORES
  abrirModalDetalles(historial: TrazabilidadPostulante): void {
    this.trazabilidadSeleccionada = historial;
    const accion = (historial.accion || '').toUpperCase();

    if (accion === 'INSERT') {
      this.tipoModalDetalle = 'INSERT';
    } else if (accion === 'DELETE') {
      this.tipoModalDetalle = 'DELETE';
    } else {
      this.tipoModalDetalle = 'UPDATE';
    }
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.trazabilidadSeleccionada = null;
  }

// ✅ PARSEADORES JSON (CON FILTRO DE IDs)
  getInsertDataList(audit: TrazabilidadPostulante | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresNuevos) return [];
    try {
      const parsed = JSON.parse(audit.valoresNuevos);
      return Object.keys(parsed)
        .filter(k => !k.toLowerCase().startsWith('id_')) // 👈 MAGIA: Oculta id_usuario, id_curso, etc.
        .map(k => ({
          campo: k.replace(/_/g, ' ').toUpperCase(),
          valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
        }));
    } catch { return []; }
  }

  getDeleteDataList(audit: TrazabilidadPostulante | null): Array<{campo: string, valor: any}> {
    if (!audit || !audit.valoresAnteriores) return [];
    try {
      const parsed = JSON.parse(audit.valoresAnteriores);
      return Object.keys(parsed)
        .filter(k => !k.toLowerCase().startsWith('id_')) // 👈 MAGIA: Oculta IDs
        .map(k => ({
          campo: k.replace(/_/g, ' ').toUpperCase(),
          valor: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k], null, 2) : parsed[k]
        }));
    } catch { return []; }
  }

  getUpdateDataList(audit: TrazabilidadPostulante | null): Array<{nombre: string, anterior: any, nuevo: any}> {
    if (!audit) return [];
    try {
      const oldParsed = audit.valoresAnteriores ? JSON.parse(audit.valoresAnteriores) : {};
      const newParsed = audit.valoresNuevos ? JSON.parse(audit.valoresNuevos) : {};
      const allKeys = Array.from(new Set([...Object.keys(oldParsed), ...Object.keys(newParsed)]));

      return allKeys
        .filter(k => !k.toLowerCase().startsWith('id_')) // 👈 MAGIA: Oculta IDs en la tabla de comparación
        .map(k => ({
          nombre: k.replace(/_/g, ' ').toUpperCase(),
          anterior: oldParsed[k] !== undefined ? (typeof oldParsed[k] === 'object' ? JSON.stringify(oldParsed[k]) : oldParsed[k]) : 'N/A',
          nuevo: newParsed[k] !== undefined ? (typeof newParsed[k] === 'object' ? JSON.stringify(newParsed[k]) : newParsed[k]) : 'N/A'
        }));
    } catch { return []; }
  }

  // Utilidades de diseño
  formatSeccion(seccion: string): string {
    if (!seccion) return 'Perfil';
    // Mapeo amigable de las tablas
    const nombres: {[key: string]: string} = {
      'PERFIL_ACADEMICO': 'Información Académica',
      'EXP_LABORAL': 'Experiencia Laboral',
      'CURSOS': 'Cursos y Certificaciones',
      'USUARIO_IDIOMA': 'Idiomas',
      'DOCUMENTACION_ACADEMICA': 'Documentos',
      'EXP_LABORAL_CARGO': 'Cargos Desempeñados'
    };
    return nombres[seccion.toUpperCase()] || seccion.replace(/_/g, ' ');
  }

  getIconoSeccion(seccion: string): string {
    const sec = seccion?.toUpperCase() || '';
    if (sec.includes('ACADEMICO') || sec.includes('CURSOS')) return 'school';
    if (sec.includes('EXP_LABORAL')) return 'work';
    if (sec.includes('IDIOMA')) return 'translate';
    if (sec.includes('DOCUMENTO')) return 'description';
    return 'person';
  }

  getAccionClass(accion: string): string {
    if (!accion) return 'accion-otro';
    const acc = accion.toUpperCase();
    if (acc === 'INSERT') return 'accion-crear';
    if (acc === 'UPDATE') return 'accion-editar';
    if (acc === 'DELETE') return 'accion-eliminar';
    return 'accion-otro';
  }

  formatearFechaHora(fecha: string | null | undefined): string {
    if (!fecha) return '—';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
