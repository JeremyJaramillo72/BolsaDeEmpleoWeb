import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {OfertaLaboralDTO} from '../../../../services/oferta.service';

@Component({
  selector: 'app-admin-validar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-validar.html',
  styleUrls: ['./admin-validar.css'] //
})
export class AdminValidarOfertasComponent implements OnInit {
  offers: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Aqui luego luego se llama a el backend /api/ofertas-laborales/estado/PENDIENTE
    this.offers = [
      { id: 1, nombreEmpresa: 'Tech Corp', titulo: 'Desarrollador Java', salario: 1200, fecha: new Date() }
    ];
  }

  aprobar(id: number) {
    console.log('Aprobando oferta:', id);
    // Logica para PUT /api/ofertas-laborales/{id}/validar con status APROBADA
  }

  rechazar(id: number) {
    const motivo = prompt('Motivo del rechazo:');
    if(motivo) console.log('Rechazando oferta:', id, 'Motivo:', motivo);
  }
}

