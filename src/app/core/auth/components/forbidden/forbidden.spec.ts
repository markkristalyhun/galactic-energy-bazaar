import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forbidden } from './forbidden';
import {RouterModule} from '@angular/router';
import {TranslocoTestingModule} from '@jsverse/transloco';

describe('Forbidden', () => {
  let component: Forbidden;
  let fixture: ComponentFixture<Forbidden>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Forbidden,
        RouterModule,
        TranslocoTestingModule,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {},
          },
        })
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Forbidden);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
