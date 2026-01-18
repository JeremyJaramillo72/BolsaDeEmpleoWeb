import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCandidato } from './registro-candidato';

describe('RegistroCandidato', () => {
  let component: RegistroCandidato;
  let fixture: ComponentFixture<RegistroCandidato>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCandidato]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroCandidato);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
