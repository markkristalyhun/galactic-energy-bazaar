import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { PlanetInfoComponent } from './planet-info';
import { Currency } from '@core/currency/models/currency';
import { TemperatureUnit } from '@core/planet/models/planet.model';

describe('PlanetInfoComponent', () => {
  let component: PlanetInfoComponent;
  let fixture: ComponentFixture<PlanetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlanetInfoComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: {
            availableLangs: ['en'],
            defaultLang: 'en',
          }
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanetInfoComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('planet', {
      id: 'test-planet',
      name: 'Test Planet',
      currency: Currency.USD,
      locale: 'en-US',
      temperatureUnit: TemperatureUnit.CELSIUS,
      weather: 'Clear',
      climateZones: [],
      population: 1000000,
      sector: 'Alpha',
      energySources: []
    });
    fixture.componentRef.setInput('locale', 'en-US');

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
