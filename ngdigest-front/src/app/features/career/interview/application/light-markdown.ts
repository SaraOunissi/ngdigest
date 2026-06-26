/**
 * Light inline markdown used in interview answers: **bold**, `code`, *em*.
 * Ported from the reference mockup. Input is escaped first so any literal
 * angle bracket in the copy can't inject markup.
 */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (char) => HTML_ESCAPES[char] ?? char);
}

export function lightMarkdown(value: string): string {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  return text;
}

export interface SplitAnswer {
  readonly main: string;
  readonly note: string | null;
}

/** Splits an answer into its main text and the optional "💡" modern note. */
export function splitAnswer(text: string): SplitAnswer {
  const index = text.indexOf('💡');
  if (index === -1) {
    return { main: text, note: null };
  }
  return { main: text.slice(0, index).trim(), note: text.slice(index + 2).trim() };
}

/** Strips markdown markers for plain-text contexts (e.g. JSON-LD). */
export function stripMarkdown(value: string): string {
  return value
    .replace(/[*`]/g, '')
    .replace(/💡/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
