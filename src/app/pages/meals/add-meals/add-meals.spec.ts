import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMeals } from './add-meals';

describe('AddMeals', () => {
  let component: AddMeals;
  let fixture: ComponentFixture<AddMeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMeals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
