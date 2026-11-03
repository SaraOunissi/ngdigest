import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';

import fr from '../../../../../../../../public/assets/i18n/fr.json';
import { ToolsHubComponent } from './tools-hub';

describe('ToolsHubComponent', () => {
  it("liste l'outil versions et le toolkit, chacun avec son lien", async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsHubComponent],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'fr' })],
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('fr', fr);
    translate.use('fr');
    const fixture = TestBed.createComponent(ToolsHubComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const links = [...element.querySelectorAll<HTMLAnchorElement>('.th-card__link')].map((link) => link.getAttribute('href'));
    expect(links).toEqual(['/fr/outils/support-versions-angular', '/fr/carriere/toolkit']);
    expect(element.querySelector('.th-card__highlight')?.textContent).toMatch(/^Angular \d+ : fin de tout support le /);
  });
});
