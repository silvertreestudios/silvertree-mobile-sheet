/**
 * Converts an HTML string to plain text for display in React Native Text components.
 *
 * NOTE: React Native Text components do not render HTML — they display raw text only.
 * This function is used purely to present human-readable descriptions in the UI.
 * There is no HTML injection or XSS vector in React Native Text components.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  // Replace common block-level closing tags with newlines before stripping
  let text = html
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  // Remove all tags by splitting on '<' and discarding content up to '>'
  const parts = text.split('<');
  const stripped = parts
    .map((part, index) => {
      if (index === 0) return part;
      const closeIndex = part.indexOf('>');
      return closeIndex >= 0 ? part.slice(closeIndex + 1) : part;
    })
    .join('');

  // Decode basic HTML entities
  const decoded = stripped
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&');

  // Collapse multiple blank lines
  return decoded.replace(/\n{3,}/g, '\n\n').trim();
}
