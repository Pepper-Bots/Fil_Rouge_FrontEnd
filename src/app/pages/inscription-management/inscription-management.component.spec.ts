import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionManagementComponent } from './inscription-management.component';

describe('InscriptionManagementComponent', () => {
  let component: InscriptionManagementComponent;
  let fixture: ComponentFixture<InscriptionManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
