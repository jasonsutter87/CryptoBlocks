/**
 * Domain blocklist patterns for child safety.
 * Patterns are tested against the full URL (hostname + path + query).
 */
export const BLOCKED_DOMAIN_PATTERNS: RegExp[] = [
  // Adult TLDs
  /\.xxx(\/|$)/i,
  /\.adult(\/|$)/i,
  /\.porn(\/|$)/i,
  /\.sex(\/|$)/i,

  // Known adult sites
  /pornhub\.com/i,
  /xvideos\.com/i,
  /xnxx\.com/i,
  /redtube\.com/i,
  /youporn\.com/i,
  /onlyfans\.com/i,
  /xhamster\.com/i,
  /brazzers\.com/i,
  /chaturbate\.com/i,
  /livejasmin\.com/i,
  /stripchat\.com/i,
  /bongacams\.com/i,

  // Gambling
  /bet365\.com/i,
  /pokerstars\.com/i,
  /casino\.com/i,
  /draftkings\.com/i,
  /fanduel\.com/i,

  // Violence / gore
  /bestgore\./i,
  /kaotic\.com/i,
  /liveleak\.com/i,
  /theync\.com/i,

  // Hate / extremism
  /stormfront\.org/i,
  /dailystormer\./i,
  /8kun\./i,
  /4chan\.org/i,

  // CSAM / child exploitation (highest priority block)
  /csam/i,
  /child.?porn/i,
  /child.?abuse/i,
  /child.?exploit/i,
  /underage/i,
  /pedo(phile|philia)?/i,
  /preteen/i,
  /lolita/i,
  /jailbait/i,
  /cp[_\-\s]?(vid|pic|img|download)/i,

  // Dark web / onion services
  /\.onion(\/|$)/i,

  // Suspicious URL path keywords
  /\/porn\//i,
  /\/adult\//i,
  /\/nsfw\//i,
  /\/nude[s]?\//i,
  /\/explicit\//i,
  /\/xxx\//i,
  /\/loli\//i,
  /\/shota\//i,

  // Suspicious query params
  /[?&]nsfw=/i,
  /[?&]adult=/i,
  /[?&]explicit=/i,
  /[?&]underage=/i,
]

/**
 * Maps search engine domain patterns to query params that enforce safe search.
 */
export const SAFESEARCH_PARAMS: { pattern: RegExp; param: string; value: string }[] = [
  { pattern: /google\./i, param: 'safe', value: 'active' },
  { pattern: /bing\.com/i, param: 'safesearch', value: 'strict' },
  { pattern: /duckduckgo\.com/i, param: 'kp', value: '1' },
  { pattern: /yahoo\.com/i, param: 'vm', value: 'r' },
]
