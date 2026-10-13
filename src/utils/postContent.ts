import DOMPurify from 'dompurify';

export type PostContentBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'image'; src: string };

const POST_IMAGE_MARKER_REGEX = /^\{\{image:\s*(.+?)\s*\}\}$/i;
const IMAGE_SOURCE_REGEX = /^(https?:\/\/|\/|data:image\/)/i;
const HTML_CONTENT_REGEX = /<\/?[a-z][^>]*>/i;

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function sanitizePostHtml(content: string): string {
  return DOMPurify.sanitize(String(content || ''), {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['img'],
    ADD_ATTR: ['src', 'alt', 'title', 'target', 'rel'],
  });
}

export function normalizePostContentForEditor(content: string): string {
  const value = String(content || '').trim();
  if (!value) return '<p></p>';
  if (HTML_CONTENT_REGEX.test(value)) return sanitizePostHtml(value);

  const html = parsePostContent(value).map((block) => {
    if (block.type === 'image') {
      return `<img src="${escapeHtml(block.src)}" alt="" />`;
    }
    return `<p>${escapeHtml(block.content).replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return sanitizePostHtml(html || '<p></p>');
}

export function toSafePostHtml(content: string): string {
  const value = String(content || '').trim();
  if (HTML_CONTENT_REGEX.test(value)) return sanitizePostHtml(value);
  return normalizePostContentForEditor(value);
}

export function parsePostContent(content: string): PostContentBlock[] {
  return String(content || '')
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map<PostContentBlock>((block) => {
      const matched = block.match(POST_IMAGE_MARKER_REGEX);
      if (matched) {
        const src = matched[1].trim();
        if (IMAGE_SOURCE_REGEX.test(src)) {
          return { type: 'image', src };
        }
      }

      return { type: 'paragraph', content: block };
    });
}

export function getPlainTextPostContent(content: string): string {
  const value = String(content || '');
  const plainText = HTML_CONTENT_REGEX.test(value)
    ? sanitizePostHtml(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    : value;

  return parsePostContent(plainText)
    .filter((block) => block.type === 'paragraph')
    .map((block) => block.content)
    .join('\n\n');
}

export function createPostImageMarker(src: string): string {
  return `{{image:${String(src || '').trim()}}}`;
}