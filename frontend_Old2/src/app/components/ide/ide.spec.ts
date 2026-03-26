import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IDE } from './ide';

describe('IDE', () => {
  let component: IDE;
  let fixture: ComponentFixture<IDE>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IDE],
    }).compileComponents();

    fixture = TestBed.createComponent(IDE);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
