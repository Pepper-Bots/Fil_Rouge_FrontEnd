import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffichageDossiersComponent } from './affichage-dossiers.component';

describe('AffichageDossiersComponent', () => {
  let component: AffichageDossiersComponent;
  let fixture: ComponentFixture<AffichageDossiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffichageDossiersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AffichageDossiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
