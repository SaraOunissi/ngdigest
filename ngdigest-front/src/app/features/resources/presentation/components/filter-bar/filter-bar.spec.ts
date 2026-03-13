import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { FilterBar } from './filter-bar';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({
      'filter.all': 'Tous',
      'filter.fr': 'Français',
      'filter.en': 'English',
    });
  }
}

describe('FilterBar', () => {
  let fixture: ComponentFixture<FilterBar>;
  let component: FilterBar;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        FilterBar,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader },
        }),
      ],
    }).compileComponents();

    TestBed.inject(TranslateService).use('fr');

    fixture = TestBed.createComponent(FilterBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initial render', () => {
    it('should render 3 filter buttons', () => {
      // Arrange & Act
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Assert
      expect(buttons.length).toBe(3);
    });

    it('should mark the "Tous" button as active by default', () => {
      // Arrange & Act
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Assert
      expect(buttons[0].nativeElement.classList).toContain('filter-bar__btn--active');
      expect(buttons[1].nativeElement.classList).not.toContain('filter-bar__btn--active');
      expect(buttons[2].nativeElement.classList).not.toContain('filter-bar__btn--active');
    });
  });

  describe('user interactions', () => {
    it('should emit "fr" and activate the FR button on click', () => {
      // Arrange
      const emittedValues: string[] = [];
      component.langChange.subscribe(value => emittedValues.push(value));
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Act
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      // Assert
      expect(emittedValues).toEqual(['fr']);
      expect(buttons[1].nativeElement.classList).toContain('filter-bar__btn--active');
      expect(buttons[0].nativeElement.classList).not.toContain('filter-bar__btn--active');
      expect(buttons[2].nativeElement.classList).not.toContain('filter-bar__btn--active');
    });

    it('should emit "en" and activate the EN button on click', () => {
      // Arrange
      const emittedValues: string[] = [];
      component.langChange.subscribe(value => emittedValues.push(value));
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Act
      buttons[2].nativeElement.click();
      fixture.detectChanges();

      // Assert
      expect(emittedValues).toEqual(['en']);
      expect(buttons[2].nativeElement.classList).toContain('filter-bar__btn--active');
      expect(buttons[0].nativeElement.classList).not.toContain('filter-bar__btn--active');
      expect(buttons[1].nativeElement.classList).not.toContain('filter-bar__btn--active');
    });

    it('should emit "all" and restore "Tous" as active after switching away', () => {
      // Arrange
      const emittedValues: string[] = [];
      component.langChange.subscribe(value => emittedValues.push(value));
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Act
      buttons[1].nativeElement.click(); // switch to FR
      fixture.detectChanges();
      buttons[0].nativeElement.click(); // back to All
      fixture.detectChanges();

      // Assert
      expect(emittedValues).toEqual(['fr', 'all']);
      expect(buttons[0].nativeElement.classList).toContain('filter-bar__btn--active');
      expect(buttons[1].nativeElement.classList).not.toContain('filter-bar__btn--active');
    });

    it('should emit again if the same active button is clicked', () => {
      // Arrange
      const emittedValues: string[] = [];
      component.langChange.subscribe(value => emittedValues.push(value));
      const buttons = fixture.debugElement.queryAll(By.css('.filter-bar__btn'));

      // Act
      buttons[0].nativeElement.click(); // click "Tous" while already active
      fixture.detectChanges();

      // Assert
      expect(emittedValues).toEqual(['all']);
    });
  });
});
