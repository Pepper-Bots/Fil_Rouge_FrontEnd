import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersListComponent } from './dossiers-list.component';

describe('DossiersListComponent', () => {
  let component: DossiersListComponent;
  let fixture: ComponentFixture<DossiersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossiersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DossiersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
