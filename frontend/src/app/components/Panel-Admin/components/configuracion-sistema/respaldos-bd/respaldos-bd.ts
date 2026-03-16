import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RespaldosDbService } from '../../../services/respaldos-db.service';
import { UiNotificationService } from '../../../../../services/ui-notification.service';

@Component({
  selector: 'app-respaldos-bd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respaldos-bd.html',
  styleUrls: ['./respaldos-bd.css'],
})
export class RespaldosBd implements OnInit {
  private respaldosService = inject(RespaldosDbService);
  public cdr = inject(ChangeDetectorRef);

  // 🔥 2. Inyectamos el servicio al estilo moderno de Angular
  private ui = inject(UiNotificationService);

  restaurandoArchivo: number | null = null;
  tipoFrecuencia: string = 'SEMANAL';
  intervaloValor: number = 1;
  isBackingUp: boolean = false;
  descargandoArchivo: string | null = null;

  autoBackupHabilitado: boolean = false;
  horaRespaldo: string = '03:00';
  diasSemana = [
    {inicial: 'Lu', nombre: 'Lu', seleccionado: false},
    {inicial: 'Ma', nombre: 'Ma', seleccionado: false},
    {inicial: 'Mi', nombre: 'Mi', seleccionado: false},
    {inicial: 'Ju', nombre: 'Ju', seleccionado: false},
    {inicial: 'Vi', nombre: 'Vi', seleccionado: false},
    {inicial: 'Sá', nombre: 'Sá', seleccionado: false},
    {inicial: 'Do', nombre: 'Do', seleccionado: false}
  ];

  historialBackups: any[] = [];
  cargandoHistorial: boolean = false;

  ngOnInit(): void {
    this.cargarConfiguracion();
    this.cargarHistorial();
  }

  ejecutarBackup() {
    this.isBackingUp = true;
    this.respaldosService.generarYDescargarBackup().subscribe({
      next: (blob: Blob) => {
        this.isBackingUp = false;
        this.cdr.detectChanges();

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fecha = new Date().toLocaleString().replace(/[\/\s:,]/g, '-');
        a.download = `Backup_Seguridad_${fecha}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.ui.exito('¡Respaldo completado y guardado en la Nube!');
        this.cargarHistorial();
      },
      error: (err) => {
        this.isBackingUp = false;
        this.cdr.detectChanges();
        console.error('Error del servidor:', err);

        this.ui.error('Falló la generación de la copia de seguridad.');
        this.cargarHistorial();
      }
    });
  }

  cargarConfiguracion() {
    this.respaldosService.obtenerConfiguracion().subscribe(res => {
      if (res) {
        this.autoBackupHabilitado = res.habilitado || false;
        this.tipoFrecuencia = res.tipoFrecuencia || 'SEMANAL';
        this.intervaloValor = res.intervalo || 1;

        if (res.horaEjecucion) {
          this.horaRespaldo = Array.isArray(res.horaEjecucion)
            ? `${this.padZero(res.horaEjecucion[0])}:${this.padZero(res.horaEjecucion[1])}`
            : res.horaEjecucion.substring(0, 5);
        }

        const diasGuardados = res.diasSemana ? res.diasSemana.split(',') : [];
        this.diasSemana.forEach(d => {
          d.seleccionado = diasGuardados.includes(d.inicial);
        });

        this.cdr.detectChanges();
      }
    });
  }

  toggleDia(index: number) {
    if (this.autoBackupHabilitado) {
      this.diasSemana[index].seleccionado = !this.diasSemana[index].seleccionado;
      this.cdr.detectChanges();
    }
  }

  guardarConfiguracionAutomatica() {
    const diasSeleccionados = this.diasSemana.filter(d => d.seleccionado).map(d => d.inicial).join(',');

    const config = {
      habilitado: this.autoBackupHabilitado,
      tipoFrecuencia: this.tipoFrecuencia,
      intervalo: this.intervaloValor,
      horaEjecucion: this.horaRespaldo + ':00',
      diasSemana: diasSeleccionados
    };

    this.respaldosService.guardarConfiguracion(config).subscribe({
      next: () => this.ui.exito('Configuración guardada con éxito.'),
      error: (err) => {
        console.error('Error guardando config:', err);
        this.ui.error('Hubo un error al guardar la configuración.');
      }
    });
  }

  cargarHistorial() {
    this.cargandoHistorial = true;
    this.cdr.detectChanges();

    this.respaldosService.obtenerHistorial().subscribe({
      next: (res) => {
        this.historialBackups = res.sort((a, b) => {
          return new Date(b.fechaEjecucion).getTime() - new Date(a.fechaEjecucion).getTime();
        });
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  formatearTamano(bytes: number): string {
    if (!bytes || bytes === 0) return '--';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return mb.toFixed(2) + ' MB';
    return (mb / 1024).toFixed(2) + ' GB';
  }

  restaurarBackup(idBackup: number) {
    const confirmado = confirm(
      'Esto descargará el respaldo desde Azure y creará una NUEVA base de datos. El proceso puede tardar un par de minutos. ¿Deseas continuar?'
    );

    if (confirmado) {
      this.restaurandoArchivo = idBackup;
      this.cdr.detectChanges();

      this.respaldosService.restaurarEnNuevaBd(idBackup).subscribe({
        next: (res: any) => {
          this.restaurandoArchivo = null;
          this.cdr.detectChanges();

          const nombreDb = res?.nombreNuevaBd || 'creada exitosamente';
          this.ui.exito(`¡Éxito! Nueva base de datos clonada: ${nombreDb}`);
        },
        error: (err) => {
          this.restaurandoArchivo = null;
          this.cdr.detectChanges();
          console.error('Error restaurando la base de datos:', err);
          // 🔥 7. Cambiamos el alert por error
          this.ui.error('Error crítico al restaurar la base de datos. Revisa la consola.');
        }
      });
    }
  }

  descargarRespaldoHistorial(item: any) {
    if (!item.urlAzure) {
      this.ui.error('Error: No se encontró la ruta del archivo en la nube.');
      return;
    }

    const urlParts = item.urlAzure.split('/');
    const fileName = urlParts[urlParts.length - 1];

    this.descargandoArchivo = item.idBackup;
    this.cdr.detectChanges();

    this.respaldosService.descargarDeAzure(fileName).subscribe({
      next: (blob: Blob) => {
        this.descargandoArchivo = null;
        this.cdr.detectChanges();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.descargandoArchivo = null;
        this.cdr.detectChanges();
        console.error('Error descargando de Azure:', err);

        this.ui.error('No se pudo descargar el archivo de Azure. Posiblemente fue eliminado.');
      }
    });
  }
}
