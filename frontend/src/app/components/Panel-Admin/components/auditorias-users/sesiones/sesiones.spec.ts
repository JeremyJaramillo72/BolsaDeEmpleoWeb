import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sesiones } from './sesiones';

describe('Sesiones', () => {
  let component: Sesiones;
  let fixture: ComponentFixture<Sesiones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sesiones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sesiones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
