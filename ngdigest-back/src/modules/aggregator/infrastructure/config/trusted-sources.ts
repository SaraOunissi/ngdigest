/**
 * Whitelist of trusted Angular community domains.
 * Articles from these sources receive a +3 relevance score boost.
 * Add new domains here to extend the list.
 */
export const TRUSTED_DOMAINS: readonly string[] = [
  // Official Angular
  'angular.dev',
  'blog.angular.dev',
  'github.com/angular',
  // Community platforms
  'dev.to',
  'medium.com',
  'hashnode.com',
  'substack.com',
  // Angular-specific blogs
  'indepth.dev',
  'netbasal.com',
  'angular-university.io',
  'ultimatecourses.com',
  'ninja-squad.com',
  'angular.love',
  // Ecosystem
  'ngrx.io',
  'ngx-translate.org',
  // French Angular community
  'grafikart.fr',
  'jesuisundev.com',
  'la-cascade.io',
  'putaindecode.io',
  'alticreation.com',
  'bonjour-angular.com',
  'devtobecurious.fr',
  'angulardevs.fr',
  'easyangularkit.com',
  // General web dev
  'css-tricks.com',
  'smashingmagazine.com',
  'web.dev',
  'betterprogramming.pub',
  // Video
  'youtube.com',
  'youtu.be',
  // Newsletters / curators
  'thisweekingangular.com',
  'joshmorony.com',
  'thetrendycoder.com',
] as const;
