import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostulacionService } from '../../../services/postulacion.service';
@Component({
  selector: 'app-lista-postulantes',
  imports: [CommonModule],
  templateUrl: './lista-postulantes.html',
  styleUrl: './lista-postulantes.css',
})
export class ListaPostulantesComponent implements OnInit {

  postulantes: any[] = [];
  idOferta!: number;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postulacionService: PostulacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('idOferta');
      if (id) {
        this.idOferta = Number(id);
        this.cargarPostulantes();
      }
    });
  }

  cargarPostulantes(): void {
    this.postulacionService.obtenerCandidatosDeOferta(this.idOferta).subscribe({
      next: (data) => {
        this.postulantes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar postulantes', err);
        this.cargando = false;
      }
    });
  }

  verPerfilCompleto(idPostulacion: number): void {

    this.router.navigate(['/menu-principal/postulacion', idPostulacion, 'perfil']);
  }

  volver(): void {
    this.router.navigate(['/menu-principal/revision-postulantes']);
  }
}
