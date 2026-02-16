import { describe, it, expect } from 'vitest'
import { BLOCKED_DOMAIN_PATTERNS, SAFESEARCH_PARAMS } from '../blocklist'

describe('BLOCKED_DOMAIN_PATTERNS', () => {
  it('contains patterns (non-empty)', () => {
    expect(BLOCKED_DOMAIN_PATTERNS.length).toBeGreaterThan(0)
  })

  it('every pattern is a valid RegExp', () => {
    for (const pattern of BLOCKED_DOMAIN_PATTERNS) {
      expect(pattern).toBeInstanceOf(RegExp)
    }
  })

  describe('matches known adult domains', () => {
    const adultDomains = [
      'https://pornhub.com/video',
      'https://xvideos.com',
      'https://xnxx.com/page',
      'https://redtube.com',
      'https://onlyfans.com/creator',
      'https://xhamster.com',
      'https://chaturbate.com',
    ]

    for (const domain of adultDomains) {
      it(`blocks ${domain}`, () => {
        const matched = BLOCKED_DOMAIN_PATTERNS.some(
          (p) => p.test(domain) || p.test(new URL(domain).hostname)
        )
        expect(matched).toBe(true)
      })
    }
  })

  describe('matches adult TLDs', () => {
    const adultTLDs = [
      'https://anything.xxx/',
      'https://site.adult/',
      'https://site.porn/',
      'https://site.sex/',
    ]

    for (const url of adultTLDs) {
      it(`blocks ${url}`, () => {
        const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
        expect(matched).toBe(true)
      })
    }
  })

  describe('matches gambling domains', () => {
    it('blocks bet365.com', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('bet365.com'))
      expect(matched).toBe(true)
    })

    it('blocks pokerstars.com', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('pokerstars.com'))
      expect(matched).toBe(true)
    })
  })

  describe('matches violence/hate domains', () => {
    it('blocks stormfront.org', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('stormfront.org'))
      expect(matched).toBe(true)
    })

    it('blocks 8kun', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('8kun.top'))
      expect(matched).toBe(true)
    })
  })

  describe('does NOT match safe domains', () => {
    const safeDomains = [
      'google.com',
      'github.com',
      'jsonplaceholder.typicode.com',
      'wikipedia.org',
      'scratch.mit.edu',
      'code.org',
    ]

    for (const domain of safeDomains) {
      it(`allows ${domain}`, () => {
        const matched = BLOCKED_DOMAIN_PATTERNS.some(
          (p) => p.test(domain) || p.test('https://' + domain)
        )
        expect(matched).toBe(false)
      })
    }
  })

  describe('blocks CSAM / child exploitation keywords', () => {
    const csamUrls = [
      'https://example.com/search?q=csam',
      'https://example.com/child-porn',
      'https://example.com/child_abuse_material',
      'https://example.com/child-exploitation',
      'https://example.com/underage-content',
      'https://example.com/pedophile',
      'https://example.com/preteen-stuff',
      'https://example.com/jailbait',
      'https://example.com/cp_vid_download',
    ]

    for (const url of csamUrls) {
      it(`blocks ${url}`, () => {
        const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
        expect(matched).toBe(true)
      })
    }
  })

  describe('blocks onion/dark web domains', () => {
    it('blocks .onion URLs', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('http://something.onion/page'))
      expect(matched).toBe(true)
    })

    it('blocks .onion at end of hostname', () => {
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test('abcdef.onion'))
      expect(matched).toBe(true)
    })
  })

  describe('suspicious path patterns', () => {
    it('matches /porn/ in URL path', () => {
      const url = 'https://example.com/porn/video'
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
      expect(matched).toBe(true)
    })

    it('matches /nsfw/ in URL path', () => {
      const url = 'https://example.com/nsfw/content'
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
      expect(matched).toBe(true)
    })

    it('matches /adult/ in URL path', () => {
      const url = 'https://example.com/adult/page'
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
      expect(matched).toBe(true)
    })

    it('matches /loli/ in URL path', () => {
      const url = 'https://example.com/loli/content'
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
      expect(matched).toBe(true)
    })

    it('matches /shota/ in URL path', () => {
      const url = 'https://example.com/shota/content'
      const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
      expect(matched).toBe(true)
    })

    it('does not false-positive on clean paths', () => {
      const cleanUrls = [
        'https://example.com/report/data',
        'https://example.com/api/export',
        'https://example.com/docs/getting-started',
      ]
      for (const url of cleanUrls) {
        const matched = BLOCKED_DOMAIN_PATTERNS.some((p) => p.test(url))
        expect(matched).toBe(false)
      }
    })
  })
})

describe('SAFESEARCH_PARAMS', () => {
  it('contains entries for major search engines', () => {
    expect(SAFESEARCH_PARAMS.length).toBeGreaterThanOrEqual(3)
  })

  it('has a Google entry', () => {
    const google = SAFESEARCH_PARAMS.find((r) => r.pattern.test('google.com'))
    expect(google).toBeDefined()
    expect(google!.param).toBe('safe')
    expect(google!.value).toBe('active')
  })

  it('has a Bing entry', () => {
    const bing = SAFESEARCH_PARAMS.find((r) => r.pattern.test('bing.com'))
    expect(bing).toBeDefined()
    expect(bing!.param).toBe('safesearch')
    expect(bing!.value).toBe('strict')
  })
})
