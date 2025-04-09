import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStagiaireComponent } from './edit-stagiaire.component';

describe('EditStagiaireComponent', () => {
  let component: EditStagiaireComponent;
  let fixture: ComponentFixture<EditStagiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStagiaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStagiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
