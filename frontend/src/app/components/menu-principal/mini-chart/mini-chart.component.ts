import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, Chart, CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler);

@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './mini-chart.component.html',
  styleUrls: ['./mini-chart.component.css']
})
export class MiniChartComponent implements OnInit {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];

  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#2563EB',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return context.parsed.y + ' registros';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        display: true,
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#94a3b8'
        }
      },
      y: {
        type: 'linear',
        display: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        },
        ticks: {
          font: {
            size: 10
          },
          color: '#94a3b8',
          stepSize: 1
        },
        beginAtZero: true
      }
    }
  };

  ngOnInit(): void {
    if (this.data && this.labels) {
      this.lineChartData = {
        labels: this.labels,
        datasets: [
          {
            data: this.data,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#2563EB',
            pointBorderColor: '#fff',
            pointBorderWidth: 1
          }
        ]
      };
    }
  }
}
