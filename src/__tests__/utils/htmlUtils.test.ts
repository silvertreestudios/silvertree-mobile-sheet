import { htmlToPlainText } from '../../utils/htmlUtils';

describe('htmlToPlainText', () => {
  it('returns empty string for empty input', () => {
    expect(htmlToPlainText('')).toBe('');
  });

  it('returns empty string for falsy input', () => {
    expect(htmlToPlainText(null as unknown as string)).toBe('');
    expect(htmlToPlainText(undefined as unknown as string)).toBe('');
  });

  it('strips simple tags', () => {
    expect(htmlToPlainText('<b>bold</b>')).toBe('bold');
    expect(htmlToPlainText('<em>italic</em>')).toBe('italic');
    expect(htmlToPlainText('<span class="foo">text</span>')).toBe('text');
  });

  it('converts block closing tags to newlines', () => {
    const result = htmlToPlainText('<p>First</p><p>Second</p>');
    expect(result).toContain('First');
    expect(result).toContain('Second');
    expect(result).toMatch(/First\s*\n+\s*Second/);
  });

  it('converts <br> to newline', () => {
    const result = htmlToPlainText('line1<br>line2');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
    expect(result).toMatch(/line1\n/);
  });

  it('converts <br /> self-closing to newline', () => {
    const result = htmlToPlainText('a<br />b');
    expect(result).toMatch(/a\nb/);
  });

  it('decodes HTML entities', () => {
    expect(htmlToPlainText('&lt;p&gt;')).toBe('<p>');
    expect(htmlToPlainText('&gt;')).toBe('>');
    expect(htmlToPlainText('&quot;')).toBe('"');
    expect(htmlToPlainText('&#39;')).toBe("'");
    // Note: standalone &nbsp; is trimmed since the function calls .trim() on the result.
    // Embedded &nbsp; between text becomes a space character.
    expect(htmlToPlainText('hello&nbsp;world')).toBe('hello world');
    expect(htmlToPlainText('&mdash;')).toBe('—');
    expect(htmlToPlainText('&ndash;')).toBe('–');
    expect(htmlToPlainText('AT&amp;T')).toBe('AT&T');
  });

  it('collapses multiple blank lines', () => {
    const input = '<p>A</p>\n\n\n\n<p>B</p>';
    const result = htmlToPlainText(input);
    expect(result).not.toMatch(/\n{3,}/);
  });

  it('trims leading and trailing whitespace', () => {
    expect(htmlToPlainText('  <b>text</b>  ')).toBe('text');
  });

  it('handles nested tags', () => {
    const html = '<div><p><strong>Nested</strong> content</p></div>';
    expect(htmlToPlainText(html)).toContain('Nested');
    expect(htmlToPlainText(html)).toContain('content');
  });

  it('handles heading tags', () => {
    const result = htmlToPlainText('<h2>Title</h2><p>Body</p>');
    expect(result).toContain('Title');
    expect(result).toContain('Body');
    expect(result).toMatch(/Title\n/);
  });

  it('handles list items', () => {
    const result = htmlToPlainText('<ul><li>Item 1</li><li>Item 2</li></ul>');
    expect(result).toContain('Item 1');
    expect(result).toContain('Item 2');
  });

  it('preserves plain text unchanged', () => {
    expect(htmlToPlainText('plain text')).toBe('plain text');
  });

  it('handles tags without closing angle bracket gracefully', () => {
    // Malformed HTML — should not throw
    expect(() => htmlToPlainText('<b unclosed')).not.toThrow();
  });

  it('handles complex FoundryVTT description HTML', () => {
    const html = `<p>You Channel <strong>positive</strong> energy to heal the living.</p>
<p><strong>Range</strong> touch; <strong>Target</strong> 1 willing living creature</p>
<ul>
  <li><strong>Critical Success</strong> The target regains 8 HP.</li>
  <li><strong>Success</strong> The target regains 4 HP.</li>
</ul>`;
    const result = htmlToPlainText(html);
    expect(result).toContain('positive');
    expect(result).toContain('Range');
    expect(result).toContain('Critical Success');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });
});
