import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantillaNotificacionService } from '../../../services/plantilla-notificacion.service';

export interface PlantillaDTO {
  idPlantilla: number;
  tipo: string;
  titulo: string;
  contenido: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface HistorialItem {
  idHistorial: number;
  adminNombre: string;
  adminEmail: string;
  accion: string;
  tituloAnterior: string;
  tituloNuevo: string;
  contenidoAnterior: string;
  contenidoNuevo: string;
  fechaCreacion: string;
  ipAddress?: string;
}

@Component({
  selector: 'app-plantilla-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plantilla-notificacion.html',
  styleUrls: ['./plantilla-notificacion.css']
})
export class PlantillaNotificacionComponent implements OnInit {

  @ViewChild('editorRef') editorRef!: ElementRef;

  plantillas: PlantillaDTO[] = [];
  plantillaSeleccionada: PlantillaDTO | null = null;
  historial: HistorialItem[] = [];
  variablesProtegidas: string[] = [];

  tituloEditado: string = '';
  contenidoEditado: string = ''; // valor real con variables para guardar en BD

  cargando: boolean = true;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  expandidoHistorial: { [key: number]: boolean } = {};
  filaExpandidaIndex: number | null = null;
  mostrarSeccionPlantillas: boolean = true; // Inicia abierta
  mostrarSeccionEditar: boolean = false;    // Inicia cerrada
  mostrarSeccionHistorial: boolean = false; // Inicia cerrada
  currentPage: number = 1;
  itemsPerPage: number = 5;
  constructor(
    private plantillaService: PlantillaNotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    this.cargando = true;
    this.plantillaService.obtenerPlantillas().subscribe({
      next: (plantillas: PlantillaDTO[]) => {
        this.plantillas = plantillas;
        if (plantillas.length > 0) {
          this.seleccionarPlantilla(plantillas[0]);
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando plantillas:', err);
        this.mensajeError = 'Error al cargar plantillas';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
  seleccionarPlantilla(plantilla: PlantillaDTO): void {
    this.plantillaSeleccionada = plantilla;
    this.tituloEditado = plantilla.titulo;
    this.contenidoEditado = plantilla.contenido;

    // ✅ Agregamos esta línea para llenar la cajita de arriba
    this.variablesProtegidas = this.extraerVariables(plantilla.contenido);

    this.mensajeExito = '';
    this.mensajeError = '';
    this.mostrarSeccionEditar = true;
    this.mostrarSeccionHistorial = true;
    this.cargarHistorial();

    setTimeout(() => this.renderizarEditor(), 50);
  }


  // Convierte el texto plano con variables en HTML con spans de colores
  // Convierte el texto plano con variables en HTML con spans de colores y estilos
  contenidoAHtml(texto: string): string {
    const escaped = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    return escaped.replace(/(\{\{[^}]+\}\}|\{[^}]+\})/g, (match) => {
      // 🚀 CIENCIA PURA: Le inyectamos el style directamente aquí "ahí mismo"
      return `<span class="var-chip" contenteditable="false" data-var="${match}" style="font-weight: bold; font-style: italic; font-family: monospace; color: #5b21b6; background-color: #ede9fe; padding: 2px 4px; border-radius: 4px;">${match}</span>`;
    });

  }


  // --- LÓGICA DE PAGINACIÓN ---
  get plantillasPaginadas() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.plantillas.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.plantillas.length / this.itemsPerPage);
  }

  irPrimeraPagina() { this.currentPage = 1; }
  irUltimaPagina() { this.currentPage = this.totalPages; }
  paginaAnterior() { if (this.currentPage > 1) this.currentPage--; }
  paginaSiguiente() { if (this.currentPage < this.totalPages) this.currentPage++; }



  toggleSeccion(seccion: 'plantillas' | 'editar' | 'historial'): void {
    if (seccion === 'plantillas') this.mostrarSeccionPlantillas = !this.mostrarSeccionPlantillas;
    if (seccion === 'editar') this.mostrarSeccionEditar = !this.mostrarSeccionEditar;
    if (seccion === 'historial') this.mostrarSeccionHistorial = !this.mostrarSeccionHistorial;
  }
  renderizarEditor(): void {
    if (!this.editorRef) return;
    const el = this.editorRef.nativeElement;
    el.innerHTML = this.contenidoAHtml(this.contenidoEditado);
  }

  // Extrae el texto real del editor (reponiendo las variables desde data-var)
  // Extrae el texto real del editor (reponiendo las variables desde data-var)
  extraerContenidoReal(): string {
    if (!this.editorRef) return this.contenidoEditado;
    const el = this.editorRef.nativeElement;

    // Clonar para no modificar el DOM real
    const clon = el.cloneNode(true) as HTMLElement;

    // Reemplazar cada span de variable por su valor original
    clon.querySelectorAll('.var-chip').forEach((span: Element) => {
      const valorOriginal = span.getAttribute('data-var') || '';
      const text = document.createTextNode(valorOriginal);
      span.replaceWith(text);
    });

    // 🚀 MAGIA PARA LOS ENTERS:
    // Convertimos los bloques que los navegadores crean al dar "Enter" en \n reales
    return clon.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')      // 1. Convierte los <br> (Shift+Enter) en saltos de línea
      .replace(/<div[^>]*>/gi, '\n')      // 2. Convierte los <div> (Enter en Chrome/Edge) en saltos
      .replace(/<p[^>]*>/gi, '\n')        // 3. Convierte los <p> (Enter en Firefox) en saltos
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/<[^>]+>/g, '')            // 4. Ahora sí, limpiamos los tags de cierre sobrantes (</div>, </p>)
      .trim();                            // 5. Quitamos espacios o enters accidentales al principio o al final
  }

  extraerVariables(texto: string): string[] {
    // Busca todo lo que esté entre {llaves} o {{dobles llaves}}
    const matches = texto.match(/(\{\{[^}]+\}\}|\{[^}]+\})/g) || [];
    // Retorna solo los valores únicos para que no se repitan en la lista
    return Array.from(new Set(matches));
  }
  guardarCambios(): void {
    if (!this.plantillaSeleccionada) return;

    if (!this.tituloEditado?.trim()) {
      this.mensajeError = '❌ El título no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    const contenidoReal = this.extraerContenidoReal();

    if (!contenidoReal?.trim()) {
      this.mensajeError = '❌ El contenido no puede estar vacío';
      this.mensajeExito = '';
      return;
    }

    if (this.tituloEditado === this.plantillaSeleccionada.titulo &&
      contenidoReal === this.plantillaSeleccionada.contenido) {
      this.mensajeError = '❌ No hay cambios para guardar';
      this.mensajeExito = '';
      return;
    }


    this.guardando = true;

    this.plantillaService.actualizarPlantilla(
      this.plantillaSeleccionada.idPlantilla,
      this.tituloEditado,
      contenidoReal
    ).subscribe({
      next: (response: any) => {
        if (response.exito) {
          this.mensajeExito = response.mensaje;
          this.mensajeError = '';
          this.plantillaSeleccionada!.titulo = this.tituloEditado;
          this.plantillaSeleccionada!.contenido = contenidoReal;
          this.contenidoEditado = contenidoReal;
          this.cargarHistorial();
        } else {
          this.mensajeError = response.mensaje;
          this.mensajeExito = '';
        }
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeError = '❌ Error al guardar: ' + (err.error?.mensaje || err.message);
        this.mensajeExito = '';
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleFilaHistorial(index: number) {
    // Si das clic en la misma, se cierra. Si no, se abre la nueva.
    this.filaExpandidaIndex = this.filaExpandidaIndex === index ? null : index;
  }
  cancelarCambios(): void {
    if (!this.plantillaSeleccionada) return;
    this.tituloEditado = this.plantillaSeleccionada.titulo;
    this.contenidoEditado = this.plantillaSeleccionada.contenido;
    this.mensajeError = '';
    this.mensajeExito = '';
    setTimeout(() => this.renderizarEditor(), 50);
  }

  cargarHistorial(): void {
    if (!this.plantillaSeleccionada) return;
    this.plantillaService.obtenerHistorial(this.plantillaSeleccionada.idPlantilla).subscribe({
      next: (data: HistorialItem[]) => {
        this.historial = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error cargando historial:', err)
    });
  }

  toggleHistorial(idHistorial: number): void {
    this.expandidoHistorial[idHistorial] = !this.expandidoHistorial[idHistorial];
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (date.toDateString() === hoy.toDateString()) {
      return 'Hoy ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === ayer.toDateString()) {
      return 'Ayer ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }


}
