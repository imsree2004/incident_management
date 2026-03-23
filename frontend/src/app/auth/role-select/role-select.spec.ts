import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSelect } from './role-select';

describe('RoleSelect', () => {
  let component: RoleSelect;
  let fixture: ComponentFixture<RoleSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
