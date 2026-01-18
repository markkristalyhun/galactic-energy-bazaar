import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardSkeleton } from './dashboard-skeleton';

describe('DashboardSkeleton', () => {
  let component: DashboardSkeleton;
  let fixture: ComponentFixture<DashboardSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
