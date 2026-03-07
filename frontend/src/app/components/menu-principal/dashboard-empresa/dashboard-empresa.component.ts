import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { MiniChartComponent } from '../mini-chart/mini-chart.component';
import { ChartConfiguration, ChartType, Chart, CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler } from 'chart.js';

import { UiNotificationService } from '../../../services/ui-notification.service';
import {Router} from '@angular/router';
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler);

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MiniChartComponent],
  templateUrl: './dashboard-empresa.component.html',
  styleUrls: ['../menuprincipal.css']
})
export class DashboardEmpresaComponent implements OnInit {
  datos: any = null;
  nombreUsuario = localStorage.getItem('nombre') || 'Empresa';
  isLoading: boolean = true;

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      borderColor: '#2563EB',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#2563EB'
    }]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { type: 'category', grid: { display: false } },
      y: { type: 'linear', beginAtZero: true }
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private ui: UiNotificationService) { }

  ngOnInit(): void {
    const idEmpresa = Number(localStorage.getItem('idEmpresa'));

    if (!idEmpresa) {
      this.isLoading = false;
      return;
    }

    this.dashboardService.getEmpresaStats(idEmpresa).subscribe({
      next: (res) => {
        this.datos = res;

        this.lineChartData = {
          labels: res.grafico.labels,
          datasets: [{
            data: res.grafico.data,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#2563EB'
          }]
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
       // this.ui.error(err.toString());
        this.isLoading = false;
      }
    });
  }

  formatCambio(kpi: any): string {
    if (!kpi) return '';
    const porcentaje = kpi.porcentajeCambio ? kpi.porcentajeCambio.toFixed(1) : '0';
    return `+${kpi.totalHoy} hoy (${porcentaje}%)`;
  }
}
