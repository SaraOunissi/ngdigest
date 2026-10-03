import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { TranslateLoader, TranslateNoOpLoader, provideTranslateService } from '@ngx-translate/core';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: TranslateNoOpLoader },
        }),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
