import { Routes } from "@angular/router";
import { RegistroCandidatoComponent } from "./components/registro-candidato/registro-candidato";

export const routes: Routes = [
  { path: 'registro-candidato', component: RegistroCandidatoComponent },
  { path: '', redirectTo: '/registro-candidato', pathMatch: 'full' }
];