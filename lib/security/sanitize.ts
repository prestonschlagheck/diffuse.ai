/**
 * HTML Sanitization
 * Sanitizes HTML to prevent XSS attacks
 * Used for user-generated content displayed via dangerouslySetInnerHTML
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
export function sanitizeHTML(html: string): string {
  if (!html) return ''
  
  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers like onclick="..."
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '') // Remove event handlers without quotes
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data URIs with HTML
  
  // Allow only safe HTML tags
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
  ]
  
  // Remove tags not in allowed list
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const lowerTag = tagName.toLowerCase()
    if (allowedTags.includes(lowerTag)) {
      // For anchor tags, only allow href attribute
      if (lowerTag === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i)
        if (hrefMatch) {
          const href = hrefMatch[1]
          // Only allow http/https URLs
          if (href.startsWith('http://') || href.startsWith('https://')) {
            return `<a href="${href}">`
          }
        }
        return '<a>'
      }
      return match
    }
    return '' // Remove disallowed tags
  })
  
  return sanitized
}

/**
 * Escape HTML to prevent XSS
 * Use this for displaying user input as plain text
 */
export function escapeHTML(text: string): string {
  if (!text) return ''
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}
