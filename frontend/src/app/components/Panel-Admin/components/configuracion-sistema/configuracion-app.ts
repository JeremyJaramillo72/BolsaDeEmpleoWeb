import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionAppService, SistemaEmpresaDTO } from '../../services/configuracion-app.service';
import { SistemaConfigService } from '../../services/sistema-config.service';

@Component({
  selector: 'app-configuracion-app',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-app.html',
  styleUrls: ['./configuracion-app.css']
})
export class ConfiguracionAppComponent implements OnInit {

  config: SistemaEmpresaDTO | null = null;

  // ── Campos del formulario ─────────────────────────────────────────────
  nombreAplicativo     = '';
  descripcion          = '';
  correoSoporte        = '';
  telefonoContacto     = '';
  direccionInstitucion = '';

  // ── Logo ──────────────────────────────────────────────────────────────
  logoPreviewUrl: string | null = null;
  archivoLogo:    File | null   = null;
  subiendoLogo    = false;
  // ✅ Estado para feedback visual del drag-and-drop
  isDragging      = false;

  // ── Estados UI ────────────────────────────────────────────────────────
  cargando  = true;
  guardando = false;

  mensajeExito = '';
  mensajeError = '';

  constructor(
      private service:            ConfiguracionAppService,
      private cdr:                ChangeDetectorRef,
      private sistemaConfigSvc:   SistemaConfigService   // ✅ para actualizar menú en tiempo real
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  // ── Carga inicial ─────────────────────────────────────────────────────
  cargarConfiguracion(): void {
    this.cargando = true;
    this.service.obtenerConfiguracion().subscribe({
      next: (cfg: any) => {
        this.config               = cfg;
        this.nombreAplicativo     = cfg.nombreAplicativo     ?? '';
        this.descripcion          = cfg.descripcion          ?? '';
        this.correoSoporte        = cfg.correoSoporte        ?? '';
        this.telefonoContacto     = cfg.telefonoContacto     ?? '';
        this.direccionInstitucion = cfg.direccionInstitucion ?? '';
        this.logoPreviewUrl       = null;
        this.archivoLogo          = null;
        this.cargando             = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando configuración:', err);
        this.mensajeError = 'Error al cargar la configuración del sistema.';
        this.cargando     = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Clic sobre el área del logo — abre el explorador de archivos ──────
  abrirSelectorArchivo(): void {
    const input = document.getElementById('logoInput') as HTMLInputElement;
    if (input) input.click();
  }

  // ── Drag-and-drop: dragover ───────────────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
    this.cdr.detectChanges();
  }

  // ── Drag-and-drop: dragleave ──────────────────────────────────────────
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    this.cdr.detectChanges();
  }

  // ── Drag-and-drop: drop ───────────────────────────────────────────────
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
    this.cdr.detectChanges();
  }

  // ── Selección vía input[type=file] ────────────────────────────────────
  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.procesarArchivo(input.files[0]);
  }

  // ── Validación y preview (compartido entre clic y drop) ───────────────
  private procesarArchivo(archivo: File): void {
    const maxSize = 5 * 1024 * 1024;  // 5 MB

    if (!archivo.type.startsWith('image/')) {
      this.mostrarError('Solo se permiten archivos de imagen (JPG, PNG, WebP, etc.).');
      return;
    }
    if (archivo.size > maxSize) {
      this.mostrarError('La imagen no puede superar los 5 MB.');
      return;
    }

    this.archivoLogo = archivo;

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(archivo);
  }

  // ── Subir logo ────────────────────────────────────────────────────────
  subirLogo(): void {
    if (!this.archivoLogo) return;

    this.subiendoLogo = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.service.actualizarLogo(this.archivoLogo).subscribe({
      next: (res: any) => {
        this.mostrarExito('✅ Logo actualizado correctamente.');
        // ✅ Emitir a través del service — menuprincipal.ts se actualiza sin F5
        if (res.logoUrl)                  this.sistemaConfigSvc.actualizarLogo(res.logoUrl);
        if (res.config?.nombreAplicativo) this.sistemaConfigSvc.actualizarNombre(res.config.nombreAplicativo);
        this.archivoLogo    = null;
        this.logoPreviewUrl = null;
        const input = document.getElementById('logoInput') as HTMLInputElement;
        if (input) input.value = '';
        this.cargarConfiguracion();
        this.subiendoLogo = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mostrarError('❌ Error al subir el logo: ' + (err.error?.error || err.message));
        this.subiendoLogo = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Cancelar selección de logo ────────────────────────────────────────
  cancelarLogo(): void {
    this.archivoLogo    = null;
    this.logoPreviewUrl = null;
    this.isDragging     = false;
    const input = document.getElementById('logoInput') as HTMLInputElement;
    if (input) input.value = '';
    this.cdr.detectChanges();
  }

  // ── Guardar datos generales ───────────────────────────────────────────
  guardarConfiguracion(): void {
    if (!this.nombreAplicativo.trim()) {
      this.mostrarError('El nombre del aplicativo es obligatorio.');
      return;
    }

    this.guardando    = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.service.actualizarConfiguracion({
      nombreAplicativo:     this.nombreAplicativo.trim(),
      descripcion:          this.descripcion.trim()          || null,
      correoSoporte:        this.correoSoporte.trim()        || null,
      telefonoContacto:     this.telefonoContacto.trim()     || null,
      direccionInstitucion: this.direccionInstitucion.trim() || null
    }).subscribe({
      next: (cfg: any) => {
        this.config    = cfg;
        this.guardando = false;
        // ✅ Emitir nombre a través del service — menuprincipal.ts se actualiza sin F5
        if (cfg.nombreAplicativo) this.sistemaConfigSvc.actualizarNombre(cfg.nombreAplicativo);
        this.mostrarExito('✅ Configuración guardada correctamente.');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mostrarError('❌ Error al guardar: ' + (err.error?.error || err.message));
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── Cancelar edición ─────────────────────────────────────────────────
  cancelar(): void {
    if (!this.config) return;
    this.nombreAplicativo     = this.config.nombreAplicativo     ?? '';
    this.descripcion          = this.config.descripcion          ?? '';
    this.correoSoporte        = this.config.correoSoporte        ?? '';
    this.telefonoContacto     = this.config.telefonoContacto     ?? '';
    this.direccionInstitucion = this.config.direccionInstitucion ?? '';
    this.cancelarLogo();
    this.mensajeExito = '';
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  // ── Getters ───────────────────────────────────────────────────────────
  get logoActual(): string | null {
    return this.logoPreviewUrl ?? this.config?.logoUrl ?? null;
  }
  get tieneLogoActual(): boolean {
    return !!(this.config?.logoUrl);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  mostrarExito(msg: string): void {
    this.mensajeExito = msg; this.mensajeError = '';
    setTimeout(() => { this.mensajeExito = ''; this.cdr.detectChanges(); }, 5000);
  }
  mostrarError(msg: string): void {
    this.mensajeError = msg; this.mensajeExito = '';
    setTimeout(() => { this.mensajeError = ''; this.cdr.detectChanges(); }, 7000);
  }
}
