import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Menuprincipal } from './menuprincipal';

describe('Menuprincipal', () => {
  let component: Menuprincipal;
  let fixture: ComponentFixture<Menuprincipal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menuprincipal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Menuprincipal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
