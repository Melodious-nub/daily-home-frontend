import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bazar } from './bazar';

describe('Bazar', () => {
  let component: Bazar;
  let fixture: ComponentFixture<Bazar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bazar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bazar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
