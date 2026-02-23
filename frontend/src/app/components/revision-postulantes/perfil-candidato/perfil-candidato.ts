import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PostulacionService } from '../../../services/postulacion.service';

@Component({
  selector: 'app-perfil-candidato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-candidato.html',
  styleUrl: './perfil-candidato.css',
})
export class PerfilCandidatoComponent implements OnInit {

  idPostulacion!: number;
  cargando: boolean = true;
  enviando: boolean = false;

  mensajeEvaluacion: string = '';
  perfil: any = null;
  cvUrlSegura!: SafeResourceUrl;

  experienciaList: any[] = [];
  cursosList: any[] = [];
  idiomasList: any[] = [];
  formacionList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postulacionService: PostulacionService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('idPostulacion');
      if (id) {
        this.idPostulacion = Number(id);
        this.cargarPerfil();
      }
    });
  }

  cargarPerfil(): void {
    this.postulacionService.obtenerPerfilCompleto(this.idPostulacion).subscribe({
      next: (data: any) => {
        this.perfil = data;
        this.mensajeEvaluacion = data.mensajeEvaluacion || '';

        this.experienciaList = JSON.parse(data.experienciaLaboral || '[]');
        this.cursosList = JSON.parse(data.cursosRealizados || '[]');
        this.idiomasList = JSON.parse(data.idiomas || '[]');
        this.formacionList = JSON.parse(data.formacionAcademica || '[]');

        if (data.archivoCv) {
          this.cvUrlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(data.archivoCv);
        }

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el perfil completo', err);
        this.cargando = false;
      }
    });
  }



  mostrarModalItem: boolean = false;
  itemActual: { tipo: string, id: number, estado: string } | null = null;
  observacionItem: string = '';
  errorObservacion: boolean = false;



  evaluarItem(tipo: string, idItem: number, estado: string): void {
    this.itemActual = { tipo, id: idItem, estado };
    this.observacionItem = '';
    this.errorObservacion = false;
    this.mostrarModalItem = true;
  }


  cerrarModalItem(): void {
    this.mostrarModalItem = false;
    this.itemActual = null;
    this.observacionItem = '';
    this.errorObservacion = false;
  }


  confirmarEvaluacionItem(): void {
    if (!this.itemActual) return;


    if (this.itemActual.estado === 'Rechazado' && !this.observacionItem.trim()) {
      this.errorObservacion = true;
      return;
    }

    const payload = {
      tipoItem: this.itemActual.tipo,
      idItem: this.itemActual.id,
      estado: this.itemActual.estado,
      observacion: this.observacionItem.trim()
    };

    this.postulacionService.evaluarItemIndividual(this.idPostulacion, payload).subscribe({
      next: () => {

        let lista: any[] = [];
        let campoId = '';

        if (this.itemActual!.tipo === 'experiencia') { lista = this.experienciaList; campoId = 'id_exp_laboral'; }
        else if (this.itemActual!.tipo === 'curso') { lista = this.cursosList; campoId = 'id_curso'; }
        else if (this.itemActual!.tipo === 'idioma') { lista = this.idiomasList; campoId = 'id_usuario_idioma'; }
        else if (this.itemActual!.tipo === 'documentacion') { lista = this.formacionList; campoId = 'id_academico'; }

        const itemEncontrado = lista.find(i => i[campoId] === this.itemActual!.id);
        if (itemEncontrado) {
          itemEncontrado.estado_v = this.itemActual!.estado;
        }

        this.cerrarModalItem();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`Error al evaluar ${this.itemActual!.tipo}`, err);
        alert('Error al conectar con el servidor.');
      }
    });
  }

  enviarEvaluacion(estado: string): void {
    if (!this.mensajeEvaluacion.trim()) {
      alert('Por favor, ingresa un mensaje o retroalimentación final para el candidato.');
      return;
    }

    this.enviando = true;


    const payload = {
      estado: estado,
      observacion: this.mensajeEvaluacion
    };

    this.postulacionService.evaluarPostulacionGeneral(this.idPostulacion, payload).subscribe({
      next: () => {
        alert(`La postulación ha sido marcada como ${estado} exitosamente.`);
        this.volver();
      },
      error: (err) => {
        console.error('Error al enviar dictamen final', err);
        alert('Error al guardar la evaluación final.');
        this.enviando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/menu-principal/revision-postulantes']);
  }
}
