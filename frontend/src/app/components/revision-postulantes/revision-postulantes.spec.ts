import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionPostulantes } from './revision-postulantes';

describe('RevisionPostulantes', () => {
  let component: RevisionPostulantes;
  let fixture: ComponentFixture<RevisionPostulantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionPostulantes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevisionPostulantes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
