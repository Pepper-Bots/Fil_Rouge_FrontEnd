import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDossierComponent } from './edit-dossier.component';

describe('EditDossierComponent', () => {
  let component: EditDossierComponent;
  let fixture: ComponentFixture<EditDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDossierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
