import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierFormComponent } from './dossier-form.component';

describe('DossierFormComponent', () => {
  let component: DossierFormComponent;
  let fixture: ComponentFixture<DossierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
