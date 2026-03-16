/**
 * renderRichContent
 *
 * Detects whether a string is Tiptap/ProseMirror HTML or plain text and
 * returns a sanitized HTML string safe to pass to dangerouslySetInnerHTML.
 *
 * Usage:
 *   import { renderRichContent } from '@/lib/render-rich-content'
 *   <div dangerouslySetInnerHTML={{ __html: renderRichContent(content) }} />
 */

const BLOCK_TAGS = ['<p', '<ul', '<ol', '<h1', '<h2', '<h3', '<h4', '<blockquote', '<pre']

export function isRichContent(content: string | undefined | null): boolean {
  if (!content) return false
  return BLOCK_TAGS.some((tag) => content.includes(tag))
}

/**
 * Very lightweight sanitizer — strips any <script>, <iframe>, <object>,
 * <embed>, and on* event attributes from an HTML string.
 * For a production app with user-generated content you may want to swap this
 * out for the `dompurify` package (`npm install dompurify @types/dompurify`).
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

/**
 * Returns a sanitized HTML string ready for dangerouslySetInnerHTML.
 * Plain-text strings are wrapped in a <p> tag so they render identically
 * to how they did before rich-text was introduced.
 */
export function renderRichContent(content: string | undefined | null): string {
  if (!content) return ''
  if (isRichContent(content)) {
    return sanitizeHtml(content)
  }
  // Legacy plain text — preserve line breaks
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const withBreaks = escaped.replace(/\n/g, '<br />')
  return `<p>${withBreaks}</p>`
}
