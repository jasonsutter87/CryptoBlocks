import { describe, it, expect } from 'vitest'
import {
  generateStandaloneHtml,
  generateEmbedSnippet,
  ZTA_SITE_ID,
  ZTA_SCRIPT_URL,
} from '../export-html'

// Access the private escapeHtml via the module's output — it's used internally,
// so we test it indirectly through generateStandaloneHtml.

describe('generateStandaloneHtml', () => {
  it('contains DOCTYPE, head, and body', () => {
    const html = generateStandaloneHtml('console.log("hi")')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<head>')
    expect(html).toContain('<body>')
    expect(html).toContain('</html>')
  })

  it('base64-encodes the code (verify round-trip)', () => {
    const code = 'console.log("Hello World!")'
    const html = generateStandaloneHtml(code)
    // Extract base64 from atob("...")
    const match = html.match(/atob\("([^"]+)"\)/)
    expect(match).toBeTruthy()
    const decoded = Buffer.from(match![1], 'base64').toString('utf-8')
    expect(decoded).toBe(code)
  })

  it('uses default title "CryptoBlocks Project"', () => {
    const html = generateStandaloneHtml('1+1')
    expect(html).toContain('<title>CryptoBlocks Project</title>')
  })

  it('uses custom title in <title> and header', () => {
    const html = generateStandaloneHtml('1+1', { title: 'My App' })
    expect(html).toContain('<title>My App</title>')
    // Also in the h1 header
    expect(html).toContain('>My App</h1>')
  })

  it('escapes HTML in title', () => {
    const html = generateStandaloneHtml('1+1', { title: '<script>alert("xss")</script>' })
    expect(html).not.toContain('<script>alert("xss")</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  describe('ZTA tracking', () => {
    it('includes ZTA script tag when siteId is provided', () => {
      const html = generateStandaloneHtml('1+1', { ztaSiteId: 'test-site-123' })
      expect(html).toContain(ZTA_SCRIPT_URL)
      expect(html).toContain('data-site-id="test-site-123"')
      expect(html).toContain('__zta')
    })

    it('omits ZTA when siteId is false', () => {
      const html = generateStandaloneHtml('1+1', { ztaSiteId: false })
      expect(html).not.toContain(ZTA_SCRIPT_URL)
      expect(html).not.toContain('__zta')
    })

    it('omits ZTA when siteId is empty string (default)', () => {
      // Default ZTA_SITE_ID is empty
      if (ZTA_SITE_ID === '') {
        const html = generateStandaloneHtml('1+1')
        expect(html).not.toContain('__zta')
      }
    })
  })

  it('includes error handling in the script', () => {
    const html = generateStandaloneHtml('1+1')
    expect(html).toContain('catch')
    expect(html).toContain('Error:')
  })

  it('includes CryptoBlocks footer link', () => {
    const html = generateStandaloneHtml('1+1')
    expect(html).toContain('cryptoblocks.dev')
  })
})

describe('generateEmbedSnippet', () => {
  it('returns a script tag block', () => {
    const snippet = generateEmbedSnippet('console.log("hi")')
    expect(snippet).toContain('<script>')
    expect(snippet).toContain('</script>')
  })

  it('contains CryptoBlocks Embed comment', () => {
    const snippet = generateEmbedSnippet('console.log("hi")')
    expect(snippet).toContain('<!-- CryptoBlocks Embed -->')
  })

  it('base64-encodes the code', () => {
    const code = 'console.log("Embed Test")'
    const snippet = generateEmbedSnippet(code)
    const match = snippet.match(/atob\("([^"]+)"\)/)
    expect(match).toBeTruthy()
    const decoded = Buffer.from(match![1], 'base64').toString('utf-8')
    expect(decoded).toBe(code)
  })

  it('includes ZTA when siteId provided', () => {
    const snippet = generateEmbedSnippet('1+1', { ztaSiteId: 'embed-site' })
    expect(snippet).toContain(ZTA_SCRIPT_URL)
    expect(snippet).toContain('embed-site')
  })

  it('omits ZTA when siteId is false', () => {
    const snippet = generateEmbedSnippet('1+1', { ztaSiteId: false })
    expect(snippet).not.toContain(ZTA_SCRIPT_URL)
    expect(snippet).not.toContain('__zta')
  })

  it('includes output container div', () => {
    const snippet = generateEmbedSnippet('1+1')
    expect(snippet).toContain('id="cb-embed"')
  })
})

describe('escapeHtml (tested indirectly)', () => {
  it('escapes & < > " in title', () => {
    const html = generateStandaloneHtml('1+1', { title: '&<>"' })
    expect(html).toContain('&amp;&lt;&gt;&quot;')
  })

  it('escapes angle brackets', () => {
    const html = generateStandaloneHtml('1+1', { title: 'a > b < c' })
    expect(html).toContain('a &gt; b &lt; c')
  })
})
