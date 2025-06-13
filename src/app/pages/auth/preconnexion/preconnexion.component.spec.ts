import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreconnexionComponent } from './preconnexion.component';

describe('PreconnexionComponent', () => {
  let component: PreconnexionComponent;
  let fixture: ComponentFixture<PreconnexionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreconnexionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreconnexionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
