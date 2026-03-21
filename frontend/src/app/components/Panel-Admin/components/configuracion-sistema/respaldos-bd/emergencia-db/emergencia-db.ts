import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 🔥 1. Importa ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { RespaldosDbService } from '../../../../services/respaldos-db.service';

@Component({
  selector: 'app-emergencia-db',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergencia-db.html',
  styleUrls: ['./emergencia-db.css']
})
export class EmergenciaDbComponent implements OnInit {
  private respaldosService = inject(RespaldosDbService);
  private cdr = inject(ChangeDetectorRef); // 🔥 2. Inyéctalo aquí

  backupsAzure: any[] = [];
  cargando: boolean = true;
  mensajeRestauracion: string = '';

  ngOnInit() {
    this.respaldosService.listarBackupsEmergencia().subscribe({
      next: (res) => {
        this.backupsAzure = res;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error contactando a Azure', err);
        this.cargando = false;
        this.mensajeRestauracion = 'Error crítico: Tampoco se pudo contactar con Microsoft Azure.';
        this.cdr.detectChanges();
      }
    });
  }

  restaurar(nombreArchivo: string) {
    if (confirm(`¿Estás 100% seguro de planchar el sistema con el archivo ${nombreArchivo}?`)) {
      this.mensajeRestauracion = 'Iniciando resurrección desde Azure... Por favor espere, esto puede tardar unos minutos...';
      this.cdr.detectChanges();

      this.respaldosService.restaurarEmergencia(nombreArchivo).subscribe({
        next: (res) => {
          this.mensajeRestauracion = '¡SISTEMA RECUPERADO EXITOSAMENTE! Recargando aplicación...';
          this.cdr.detectChanges();
          setTimeout(() => { window.location.href = '/login'; }, 4000);
        },
        error: (err) => {
          this.mensajeRestauracion = 'Falló la restauración: ' + err.message;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
