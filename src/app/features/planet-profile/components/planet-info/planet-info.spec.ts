import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetInfo } from './planet-info';

describe('PlanetInfo', () => {
  let component: PlanetInfo;
  let fixture: ComponentFixture<PlanetInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
