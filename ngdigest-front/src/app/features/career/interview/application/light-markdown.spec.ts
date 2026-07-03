import { escapeHtml, lightMarkdown, splitAnswer, stripMarkdown } from './light-markdown';

describe('light-markdown', () => {
  describe('escapeHtml', () => {
    it('escapes the three HTML-significant characters', () => {
      expect(escapeHtml('a < b && c > d')).toBe('a &lt; b &amp;&amp; c &gt; d');
    });

    it('leaves plain text untouched', () => {
      expect(escapeHtml('rien à échapper')).toBe('rien à échapper');
    });
  });

  describe('lightMarkdown', () => {
    it('renders inline code, bold and emphasis', () => {
      expect(lightMarkdown('use `ngOnInit`')).toBe('use <code>ngOnInit</code>');
      expect(lightMarkdown('**important**')).toBe('<strong>important</strong>');
      expect(lightMarkdown('an *idea* here')).toBe('an <em>idea</em> here');
    });

    it('escapes HTML before applying markdown, preventing injection', () => {
      // A literal <script> in the copy must never become live markup.
      const out = lightMarkdown('<script>alert(1)</script>');
      expect(out).toContain('&lt;script&gt;');
      expect(out).not.toContain('<script>');
    });

    it('does not treat bold markers as emphasis', () => {
      expect(lightMarkdown('**bold**')).toBe('<strong>bold</strong>');
      expect(lightMarkdown('**bold**')).not.toContain('<em>');
    });

    it('only opens emphasis at a boundary (start, space or paren)', () => {
      // A bare "*" mid-word (e.g. a multiplication) should not open emphasis.
      expect(lightMarkdown('2*3 = 6')).toBe('2*3 = 6');
    });
  });

  describe('splitAnswer', () => {
    it('returns the whole text and a null note when there is no 💡', () => {
      expect(splitAnswer('just an answer')).toEqual({ main: 'just an answer', note: null });
    });

    it('splits the main answer from the modern note on the 💡 marker', () => {
      expect(splitAnswer('classic answer 💡 modern take')).toEqual({
        main: 'classic answer',
        note: 'modern take',
      });
    });
  });

  describe('stripMarkdown', () => {
    it('removes markers and the bulb, and collapses whitespace', () => {
      expect(stripMarkdown('**bold** and `code` 💡  note')).toBe('bold and code note');
    });
  });
});
