import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';

import fr from '../../../../../../../../public/assets/i18n/fr.json';
import { AngularVersionsComponent } from './angular-versions';

/**
 * Rendu de la page avec les vraies traductions françaises : l'outil répond sans
 * JavaScript côté données (prérendu) et réagit à la saisie.
 */
describe('AngularVersionsComponent', () => {
  async function render(): Promise<{ element: HTMLElement; detect: () => Promise<void> }> {
    await TestBed.configureTestingModule({
      imports: [AngularVersionsComponent],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'fr' })],
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', fr);
    translate.use('fr');
    const fixture = TestBed.createComponent(AngularVersionsComponent);
    const detect = async (): Promise<void> => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };
    await detect();
    return { element: fixture.nativeElement as HTMLElement, detect };
  }

  it('affiche un résultat, le calendrier et la FAQ dès le rendu', async () => {
    const { element } = await render();

    expect(element.querySelector('h1')?.textContent).toContain("Ma version d'Angular est-elle encore supportée ?");
    expect(element.querySelector('.av-headline')?.textContent?.trim()).toMatch(/^Angular \d+ /);
    expect(element.querySelectorAll('.av-table tbody tr').length).toBeGreaterThan(5);
    expect(element.querySelectorAll('.av-faq details').length).toBeGreaterThanOrEqual(4);
    expect(element.querySelectorAll('.av-path__step a[target="_blank"]').length).toBe(
      element.querySelectorAll('.av-path__step').length,
    );
  });

  it('lit une version collée depuis package.json', async () => {
    const { element, detect } = await render();
    const input = element.querySelector<HTMLInputElement>('#av-paste')!;

    input.value = '"@angular/core": "^17.3.0",';
    input.dispatchEvent(new Event('input'));
    await detect();

    expect(element.querySelector('.av-headline')?.textContent).toContain('Angular 17');
    expect(element.querySelector('.av-status')?.textContent).toContain('Fin de support');
    expect(element.querySelector('.av-error')).toBeNull();
  });

  it('signale une saisie illisible sans changer le résultat', async () => {
    const { element, detect } = await render();
    const before = element.querySelector('.av-headline')?.textContent;
    const input = element.querySelector<HTMLInputElement>('#av-paste')!;

    input.value = 'react 19';
    input.dispatchEvent(new Event('input'));
    await detect();

    expect(element.querySelector('.av-error')?.textContent).toContain('Je ne reconnais pas cette version');
    expect(element.querySelector('.av-headline')?.textContent).toBe(before);
  });

  it('change de version avec la liste déroulante', async () => {
    const { element, detect } = await render();
    const select = element.querySelector<HTMLSelectElement>('#av-version')!;

    select.value = '9';
    select.dispatchEvent(new Event('change'));
    await detect();

    expect(element.querySelector('.av-headline')?.textContent).toContain('Angular 9 ');
    expect(element.querySelector('.av-path__count')?.textContent).toMatch(/\d+ sauts de versions majeures/);
  });
});
