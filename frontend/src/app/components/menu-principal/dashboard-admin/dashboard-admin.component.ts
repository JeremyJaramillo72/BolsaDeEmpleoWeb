import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { MiniChartComponent } from '../mini-chart/mini-chart.component';
import { ChartConfiguration, ChartType, Chart, CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler } from 'chart.js';
import {UiNotificationService} from '../../../services/ui-notification.service'
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler);

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MiniChartComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['../menuprincipal.css'],
})
export class DashboardAdminComponent implements OnInit {
  datos: any = null;
  nombreUsuario = localStorage.getItem('nombre') || 'Administrador';
  isLoading: boolean = true;

  // Cambiar de doughnut a line para mostrar tendencia histórica
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
    private ui: UiNotificationService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getAdminStats().subscribe({
      next: (res) => {
        this.datos = res;

        // Verificar si tenemos grafico multi-dataset (auditorías por usuario)
        if (res.graficoMultiDataset && res.graficoMultiDataset.datasets) {
          // Usar gráfico multi-dataset (múltiples líneas por usuario)
          this.lineChartData = {
            labels: res.graficoMultiDataset.labels,
            datasets: res.graficoMultiDataset.datasets.map((dataset: any) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: dataset.borderColor,
              backgroundColor: dataset.backgroundColor,
              borderWidth: 2,
              fill: dataset.fill !== undefined ? dataset.fill : false,
              tension: 0.4,
              pointRadius: 3,
              pointBackgroundColor: dataset.borderColor
            }))
          };

          // Habilitar leyenda para identificar usuarios
          this.lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 15,
                  font: { size: 11 }
                }
              }
            },
            scales: {
              x: { type: 'category', grid: { display: false } },
              y: { type: 'linear', beginAtZero: true }
            }
          };
        } else {
          // Fallback a gráfico simple (tendencia histórica de ofertas)
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
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error cargando estadísticas del dashboard", err);
       // this.ui.error("Error cargando estadisticas ")
        this.isLoading = false;
      }
    });
  }

  // no vale xd
  formatCambio(kpi: any): string {
    if (!kpi) return '';
    const porcentaje = kpi.porcentajeCambio ? kpi.porcentajeCambio.toFixed(1) : '0';
    return `+${kpi.totalHoy} hoy (${porcentaje}%)`;
  }
}
