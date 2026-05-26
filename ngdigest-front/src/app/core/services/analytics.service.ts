import { inject, Injectable, PLATFORM_ID, Signal, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const CONSENT_KEY = 'cookie_consent';
const GA_ID = 'G-6MGV02JE0R';
const GTAG_SCRIPT_ID = 'gtag-script';

type ConsentStatus = 'accepted' | 'refused' | 'pending';

interface GtagWindow extends Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _consentStatus: WritableSignal<ConsentStatus>;
  readonly consentStatus: Signal<ConsentStatus>;

  constructor() {
    const stored = this.isBrowser ? localStorage.getItem(CONSENT_KEY) : null;
    const initial: ConsentStatus = stored === 'accepted' || stored === 'refused' ? stored : 'pending';
    this._consentStatus = signal<ConsentStatus>(initial);
    this.consentStatus = this._consentStatus.asReadonly();

    if (initial === 'accepted') {
      this.loadGtag();
    }
  }

  accept(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(CONSENT_KEY, 'accepted');
    this._consentStatus.set('accepted');
    this.loadGtag();
  }

  refuse(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(CONSENT_KEY, 'refused');
    this._consentStatus.set('refused');
  }

  trackPageView(url: string): void {
    if (!this.isBrowser || this._consentStatus() !== 'accepted') return;
    const win = window as unknown as GtagWindow;
    if (typeof win.gtag === 'function') {
      win.gtag('event', 'page_view', { page_path: url });
    }
  }

  private loadGtag(): void {
    if (!this.isBrowser || document.getElementById(GTAG_SCRIPT_ID)) return;

    const win = window as unknown as GtagWindow;
    win.dataLayer = win.dataLayer ?? [];
    win.gtag = (...args: unknown[]) => win.dataLayer.push(args);
    win.gtag('js', new Date());
    win.gtag('config', GA_ID);

    const script = document.createElement('script');
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }
}
