import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfertaService, OfertaLaboralDTO, OfertaHabilidadDTO } from '../../services/oferta.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-ofertas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-ofertas.html',
  styleUrls: ['./gestion-ofertas.css']
})
export class GestionOfertasComponent implements OnInit {

  ofertas: OfertaLaboralDTO[] = [];
  isModalOpen: boolean = false;

  idEmpresaLogueada: number = 0;

  nuevaOferta: OfertaLaboralDTO = this.inicializarOferta();

  tempIdHabilidad: number = 0;
  tempNivel: string = 'Básico';
  tempObligatorio: boolean = false;

  constructor(private ofertaService: OfertaService,private router: Router) {}

  ngOnInit(): void {
    const idGuardado = localStorage.getItem('idEmpresa');

    console.log("ID recuperado del localStorage:", idGuardado);

    if (idGuardado) {
      this.idEmpresaLogueada = Number(idGuardado);
      this.nuevaOferta.idEmpresa = this.idEmpresaLogueada;
    } else {

      this.router.navigate(['/login']);
    }
    }

  inicializarOferta(): OfertaLaboralDTO {
    return {
      idEmpresa: this.idEmpresaLogueada,
      idModalidad: 1,
      idCategoria: 1,
      idJornada: 1,
      idCiudad: 1,
      titulo: '',
      descripcion: '',
      salarioPromedio: 0,
      fechaInicio: '',
      fechaCierre: '',
      habilidades: []
    };
  }

  cargarOfertas() {
    this.ofertaService.listarPorEmpresa(this.idEmpresaLogueada).subscribe({
      next: (data) => this.ofertas = data,
      error: (e) => console.error('Error cargando ofertas', e)
    });
  }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }

  agregarSkill() {
    if (Number(this.tempIdHabilidad) > 0) {

      const mapNombres: any = { 1: 'Java', 2: 'SQL' };

      const skill: OfertaHabilidadDTO = {
        idHabilidad: Number(this.tempIdHabilidad),
        nivelRequerido: this.tempNivel,
        esObligatorio: this.tempObligatorio,
        nombreHabilidad: mapNombres[this.tempIdHabilidad] || 'Skill ' + this.tempIdHabilidad
      };

      this.nuevaOferta.habilidades.push(skill);

      this.tempIdHabilidad = 0;
      this.tempNivel = 'Básico';
      this.tempObligatorio = false;
    }
  }

  removerSkill(index: number) {
    this.nuevaOferta.habilidades.splice(index, 1);
  }

  guardar() {
    this.ofertaService.crearOferta(this.nuevaOferta).subscribe({
      next: (resp) => {
        alert('¡Oferta creada!');
        this.closeModal();
        this.nuevaOferta = this.inicializarOferta();
        this.cargarOfertas();
      },
      error: (err) => {
        console.error(err);
        alert('Error al guardar. Revisa la consola.');
      }
    });
  }
}
