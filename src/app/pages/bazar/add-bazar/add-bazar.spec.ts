import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBazar } from './add-bazar';

describe('AddBazar', () => {
  let component: AddBazar;
  let fixture: ComponentFixture<AddBazar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBazar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBazar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
