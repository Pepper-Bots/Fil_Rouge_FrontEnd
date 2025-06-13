import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementDeclarationComponent } from './evenement-declaration.component';

describe('EvenementDeclarationComponent', () => {
  let component: EvenementDeclarationComponent;
  let fixture: ComponentFixture<EvenementDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementDeclarationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvenementDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
