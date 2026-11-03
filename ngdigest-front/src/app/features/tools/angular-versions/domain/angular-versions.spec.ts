import {
  AngularReleasesData,
  daysBetween,
  defaultMajor,
  formatDate,
  isOlderThanTracked,
  isoToday,
  latestCycle,
  migrationPath,
  parseMajor,
  statusOn,
  supportedCycles,
  upcomingReleases,
  updateGuideUrl,
} from './angular-versions';

/** Extrait de la table officielle (angular.dev, relue le 2026-11-03). */
const DATA: AngularReleasesData = {
  fetchedAt: '2026-11-03',
  source: 'test',
  cycles: [
    { major: 22, releaseDate: '2026-06-03', activeSupportEnd: '2027-06-30', ltsEnd: '2028-06-30', latest: '22.2.4', latestReleaseDate: '2026-10-29' },
    { major: 21, releaseDate: '2025-11-19', activeSupportEnd: '2026-06-03', ltsEnd: '2027-06-30', latest: '21.2.25', latestReleaseDate: '2026-09-30' },
    { major: 20, releaseDate: '2025-05-28', activeSupportEnd: '2025-11-19', ltsEnd: '2026-11-28', latest: '20.3.34', latestReleaseDate: '2026-10-14' },
    { major: 19, releaseDate: '2024-11-19', activeSupportEnd: '2025-05-28', ltsEnd: '2026-05-19', latest: '19.2.25', latestReleaseDate: '2026-06-02' },
    { major: 9, releaseDate: '2020-02-06', activeSupportEnd: '2020-08-06', ltsEnd: '2021-08-06', latest: '9.1.13', latestReleaseDate: null },
  ],
};
const TODAY = '2026-11-03';

describe('statut de support', () => {
  it('classe chaque version selon la date du jour', () => {
    expect(statusOn(DATA.cycles[0], TODAY).status).toBe('active');
    expect(statusOn(DATA.cycles[1], TODAY).status).toBe('lts');
    expect(statusOn(DATA.cycles[3], TODAY).status).toBe('eol');
  });

  it('compte les jours restants et signale une fin de LTS proche', () => {
    const v20 = statusOn(DATA.cycles[2], TODAY);
    expect(v20.status).toBe('lts');
    expect(v20.daysLeft).toBe(25);
    expect(v20.endingSoon).toBe(true);
    expect(statusOn(DATA.cycles[1], TODAY).endingSoon).toBe(false);
  });

  it('bascule le jour même de la fin de support', () => {
    expect(statusOn(DATA.cycles[2], '2026-11-27').status).toBe('lts');
    expect(statusOn(DATA.cycles[2], '2026-11-28').status).toBe('eol');
    expect(statusOn(DATA.cycles[3], TODAY).daysSinceEol).toBe(168);
  });

  it('liste les versions couvertes et présélectionne la plus ancienne', () => {
    expect(supportedCycles(DATA, TODAY).map((entry) => entry.cycle.major)).toEqual([22, 21, 20]);
    expect(defaultMajor(DATA, TODAY)).toBe(20);
    expect(defaultMajor(DATA, '2026-12-01')).toBe(21);
  });
});

describe('chemin de migration', () => {
  it('liste les majeures réellement publiées à traverser', () => {
    expect(migrationPath(DATA, 19, TODAY)).toEqual([20, 21, 22]);
    expect(migrationPath(DATA, 9, TODAY)).toEqual([19, 20, 21, 22]);
    expect(migrationPath(DATA, 22, TODAY)).toEqual([]);
  });

  it('ignore une version annoncée mais pas encore sortie', () => {
    const withFuture: AngularReleasesData = {
      ...DATA,
      cycles: [{ ...DATA.cycles[0], major: 23, releaseDate: '2027-06-01', latest: '23.0.0' }, ...DATA.cycles],
    };
    expect(latestCycle(withFuture, TODAY).major).toBe(22);
    expect(migrationPath(withFuture, 21, TODAY)).toEqual([22]);
  });

  it('pointe vers le guide officiel pour chaque saut', () => {
    expect(updateGuideUrl(20, 21)).toBe('https://angular.dev/update-guide?v=20.0-21.0&l=1');
  });
});

describe('lecture de la version saisie', () => {
  it.each([
    ['20', 20],
    ['v19', 19],
    ['20.3.34', 20],
    ['^19.2.0', 19],
    ['~18.1', 18],
    ['"@angular/core": "^17.3.0",', 17],
    ['22.0.0-next.3', 22],
  ])('%s → %s', (input, expected) => {
    expect(parseMajor(input)).toBe(expected);
  });

  it.each(['', 'react', '1', 'abc 20'])('refuse « %s »', (input) => {
    expect(parseMajor(input)).toBeNull();
  });

  it('reconnaît une version plus ancienne que la source', () => {
    expect(isOlderThanTracked(DATA, 8)).toBe(true);
    expect(isOlderThanTracked(DATA, 19)).toBe(false);
  });
});

describe('dates', () => {
  it('compte les jours entre deux dates', () => {
    expect(daysBetween('2026-11-03', '2026-11-28')).toBe(25);
    expect(daysBetween('2026-11-28', '2026-11-03')).toBe(-25);
  });

  it('prend la date du jour à Paris', () => {
    expect(isoToday(new Date('2026-11-03T23:30:00Z'))).toBe('2026-11-04');
  });

  it('écrit les dates en français et en anglais', () => {
    expect(formatDate('2026-11-28', 'fr')).toBe('28 novembre 2026');
    expect(formatDate('2026-11-01', 'fr')).toBe('1er novembre 2026');
    expect(formatDate('2026-11-28', 'en')).toBe('28 November 2026');
  });

  it('garde une sortie « ~ novembre » jusqu’à la fin du mois', () => {
    expect(upcomingReleases('2026-11-30').map((release) => release.version)).toContain('22.3');
    expect(upcomingReleases('2026-12-01').map((release) => release.version)).not.toContain('22.3');
  });
});
