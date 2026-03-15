import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasComponent } from './categorias/categorias';
import { CarrerasComponent } from './carreras/carreras';
import { FacultadesComponent } from './facultades/facultades';
import { IdiomasComponent } from './idiomas/idiomas';
import { JornadasComponent } from './jornadas/jornadas';
import { ModalidadesComponent } from './modalidades/modalidades';
import { RolesComponent } from './roles/roles';
import {ProvinciasComponent} from './provincias/provincias';
import {CiudadesComponent} from './ciudades/ciudades';

@Component({
  selector: 'app-gestion-catalogos',
  standalone: true,
  imports: [
    CommonModule,
    CategoriasComponent,
    CarrerasComponent,
    FacultadesComponent,
    IdiomasComponent,
    JornadasComponent,
    ModalidadesComponent,
    RolesComponent,
    ProvinciasComponent,
    CiudadesComponent
  ],
  templateUrl: './gestion-catalogos.html',
  styleUrls: ['./gestion-catalogos.css'],
  encapsulation: ViewEncapsulation.None // Permite que el CSS de este padre afecte a los hijos
})
export class GestionCatalogosComponent {
  tabActiva: string = 'categorias';

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
  }
}
