import { Injectable } from '@angular/core';

/**
 * Friend/referral code for the Certificates.dev partner program.
 * TODO: replace with the real code once NgDigest is registered at
 * partners.certificates.dev/program (~200 $/sale).
 */
const CERTIFICATES_DEV_FRIEND_CODE = 'NGDIGEST';

/** Identifier of an affiliate network, as stored on catalog/cert data. */
export type AffiliateNetwork = 'certificates-dev' | (string & {});

/**
 * Centralises affiliate-link concerns: builds the destination URL with the
 * right tracking parameter per network, and exposes the correct `rel` attribute
 * so affiliate links are always `sponsored nofollow`.
 */
@Injectable({ providedIn: 'root' })
export class AffiliateService {
  /**
   * Returns the destination URL augmented with the affiliate parameter for the
   * given network, or the untouched URL when no network applies.
   */
  buildUrl(baseUrl: string, network: AffiliateNetwork | null): string {
    if (!network) {
      return baseUrl;
    }
    switch (network) {
      case 'certificates-dev':
        return this.appendParam(baseUrl, 'friend', CERTIFICATES_DEV_FRIEND_CODE);
      default:
        return baseUrl;
    }
  }

  /**
   * `rel` attribute for an outbound link. Affiliate links must be flagged
   * `sponsored nofollow` for search engines and FTC-style transparency.
   */
  rel(affiliable: boolean): string {
    return affiliable ? 'sponsored nofollow noopener' : 'noopener';
  }

  private appendParam(url: string, key: string, value: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${key}=${encodeURIComponent(value)}`;
  }
}
