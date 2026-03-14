import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-respaldos-bd',
  imports: [CommonModule, FormsModule],
  templateUrl: './respaldos-bd.html',
  styleUrl: './respaldos-bd.css',
})
export class RespaldosBd {
  rutaLocal: string = 'E:\\Backups_Sistema\\';
  isBackingUp: boolean = false;

  ejecutarBackup() {
    if (!this.rutaLocal) return;

    this.isBackingUp = true;

    // Aquí llamarás a tu servicio de Spring Boot pasando this.rutaLocal como parámetro
    // this.backupService.generarBackup(this.rutaLocal).subscribe(...)

    // Simulación temporal para ver la animación
    setTimeout(() => {
      this.isBackingUp = false;
      alert(`¡Copia creada con éxito en ${this.rutaLocal} y Azure!`);
    }, 3000);
  }
}
