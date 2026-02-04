import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionOfertas } from './gestion-ofertas';

describe('GestionOfertas', () => {
  let component: GestionOfertas;
  let fixture: ComponentFixture<GestionOfertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionOfertas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionOfertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
