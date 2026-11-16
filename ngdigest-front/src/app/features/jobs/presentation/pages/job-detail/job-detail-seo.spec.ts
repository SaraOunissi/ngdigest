import { JOBS_DATA } from '../../../infrastructure/jobs-data.generated';
import { Job } from '../../../domain/models/job.model';
import { jobSeoDescription, jobSeoTitle } from './job-detail-seo';

const baseJob: Job = {
  slug: 'example',
  title: 'Frontend Engineer',
  company: 'Acme',
  companyLogo: '',
  type: 'CDI',
  remote: '100',
  zone: 'FR',
  location: null,
  language: 'fr',
  salary: null,
  tjm: null,
  stack: [],
  url: 'https://example.com',
  scannedAt: '2026-11-16',
  status: 'active',
  tags: [],
  editorialHook: 'Accroche FR',
  editorialNote: '',
  editorialHookEn: 'English hook',
};

describe('jobSeoTitle', () => {
  it('gives the FR and EN pages of the same offer different titles', () => {
    // Arrange / Act
    const frenchTitle = jobSeoTitle(baseJob, 'fr');
    const englishTitle = jobSeoTitle(baseJob, 'en');

    // Assert
    expect(frenchTitle).toBe('Frontend Engineer · Offre Angular chez Acme · NgDigest');
    expect(englishTitle).toBe('Frontend Engineer · Angular job at Acme · NgDigest');
    expect(frenchTitle).not.toBe(englishTitle);
  });

  it('never repeats a title across all published job pages (FR + EN)', () => {
    const titles = JOBS_DATA.flatMap((job) => [jobSeoTitle(job, 'fr'), jobSeoTitle(job, 'en')]);

    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('jobSeoDescription', () => {
  it('uses the hook of the page language', () => {
    expect(jobSeoDescription(baseJob, 'fr')).toBe('Accroche FR');
    expect(jobSeoDescription(baseJob, 'en')).toBe('English hook');
  });

  it('falls back to the FR hook on the EN page when no translation exists', () => {
    const job: Job = { ...baseJob, editorialHookEn: undefined };

    expect(jobSeoDescription(job, 'en')).toBe('Accroche FR');
  });

  it('builds a description in the page language when there is no hook', () => {
    const job: Job = { ...baseJob, editorialHook: '', editorialHookEn: undefined };

    expect(jobSeoDescription(job, 'fr')).toBe('Frontend Engineer chez Acme. Offre Angular sélectionnée par NgDigest.');
    expect(jobSeoDescription(job, 'en')).toBe('Frontend Engineer at Acme. Angular job hand-picked by NgDigest.');
  });
});
