import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RespaldosDbService } from '../../../services/respaldos-db.service';

@Component({
  selector: 'app-respaldos-bd',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './respaldos-bd.html',
  styleUrls: ['./respaldos-bd.css'],
})
export class RespaldosBd {
  rutaLocal: string = 'E:\\Backups_Sistema\\';
  isBackingUp: boolean = false;

  private respaldosService = inject(RespaldosDbService);

  ejecutarBackup() {
    this.isBackingUp = true;

    this.respaldosService.generarYDescargarBackup().subscribe({
      next: (blob: Blob) => {
        this.isBackingUp = false;

        const url = window.URL.createObjectURL(blob);


        const a = document.createElement('a');
        a.href = url;

        const fecha = new Date().toISOString().split('T')[0];
        a.download = `Copia_Seguridad_Bolsa_${fecha}.backup`;

        document.body.appendChild(a);
        a.click();


        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('✅ ¡Respaldo completado! Se ha guardado en Azure y la descarga ha comenzado.');
      },
      error: (err) => {
        this.isBackingUp = false;
        console.error('Error del servidor:', err);
        alert('❌ Falló la generación de la copia de seguridad. Revisa la consola del servidor.');
      }
    });
  }
}
