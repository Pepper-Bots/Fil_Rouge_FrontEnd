import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierDetailComponent } from './dossier-detail.component';

describe('DossierDetailComponent', () => {
  let component: DossierDetailComponent;
  let fixture: ComponentFixture<DossierDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossierDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossierDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
