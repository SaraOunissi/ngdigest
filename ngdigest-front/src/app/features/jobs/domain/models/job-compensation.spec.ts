import { Job } from './job.model';
import { resolveJobCompensation } from './job-compensation';

const baseJob: Job = {
  slug: 'example',
  title: 'Example',
  company: 'Example',
  companyLogo: '',
  type: 'CDI',
  remote: '100',
  zone: 'FR',
  location: null,
  language: 'fr',
  salary: '50 000 – 55 000 €/an',
  salaryEn: '€50,000 – €55,000/year',
  tjm: null,
  stack: [],
  url: 'https://example.com',
  scannedAt: '2026-09-28',
  status: 'active',
  tags: [],
  editorialHook: '',
  editorialNote: '',
};

describe('resolveJobCompensation', () => {
  it('shows the localized yearly salary for a permanent role', () => {
    expect(resolveJobCompensation(baseJob, 'fr')).toEqual({ kind: 'salary', label: '50 000 – 55 000 €/an' });
    expect(resolveJobCompensation(baseJob, 'en')).toEqual({ kind: 'salary', label: '€50,000 – €55,000/year' });
  });

  it('shows the daily rate when one is published', () => {
    const freelance: Job = { ...baseJob, type: 'Freelance', salary: null, salaryEn: undefined, tjm: '550-650€/j' };
    expect(resolveJobCompensation(freelance, 'fr')).toEqual({ kind: 'tjm', label: '550-650€/j' });
  });

  it('falls back to the yearly amount for a contractor offer without a daily rate', () => {
    const contractor: Job = { ...baseJob, type: 'Freelance', tjm: null };
    expect(resolveJobCompensation(contractor, 'en')).toEqual({ kind: 'salary', label: '€50,000 – €55,000/year' });
  });

  it('treats a blank daily rate as missing', () => {
    const blankRate: Job = { ...baseJob, type: 'Freelance', tjm: '  ' };
    expect(resolveJobCompensation(blankRate, 'fr').kind).toBe('salary');
  });
});
