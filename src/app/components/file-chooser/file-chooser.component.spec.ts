import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileChooserComponent } from './file-chooser.component';

describe('FileChooserComponent', () => {
  let component: FileChooserComponent;
  let fixture: ComponentFixture<FileChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileChooserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
