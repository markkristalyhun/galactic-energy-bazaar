import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanetProfilePage } from './planet-profile-page';

describe('PlanetProfilePage', () => {
  let component: PlanetProfilePage;
  let fixture: ComponentFixture<PlanetProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanetProfilePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetProfilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
