import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmService, ConfirmPeticion } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit, OnDestroy {

  visible  = false;
  titulo   = '';
  mensaje  = '';

  private resolver: ((valor: boolean) => void) | null = null;
  private sub!: Subscription;

  constructor(private confirmService: ConfirmService,
  private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.confirmService.peticion$.subscribe((peticion: ConfirmPeticion | null) => {
      if (peticion) {
        Promise.resolve().then(() => {
          this.titulo = peticion.titulo;
          this.mensaje = peticion.mensaje;
          this.resolver = peticion.resolver;
          this.visible = true;
          this.cdr.detectChanges();
        });
      }
    });
  }

  responder(valor: boolean): void {
    this.visible = false;
    this.resolver?.(valor);
    this.resolver = null;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
