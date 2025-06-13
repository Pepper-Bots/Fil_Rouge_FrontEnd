import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntervenantListComponent } from './intervenant-list.component';

describe('IntervenantListComponent', () => {
  let component: IntervenantListComponent;
  let fixture: ComponentFixture<IntervenantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntervenantListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntervenantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
