import type { SafetyConfig } from './types'

/**
 * Generates JavaScript code that overrides window.fetch with a safety-wrapped
 * version. Intended to be injected into the sandbox iframe before user code runs.
 */
export function generateSafeFetchCode(config: SafetyConfig): string {
  const patternSources = config.blockedPatterns.map((p) => ({
    source: p.source,
    flags: p.flags,
  }))

  return `
;(function() {
  var __realFetch = window.fetch;
  var __requestCount = 0;
  var __maxRequests = ${config.maxRequestsPerExecution};
  var __maxResponseSize = ${config.maxResponseSize};
  var __httpsOnly = ${config.httpsOnly};
  var __enforceSafeSearch = ${config.enforceSafeSearch};
  var __allowedContentTypes = ${JSON.stringify(config.allowedContentTypes)};
  var __allowlist = ${JSON.stringify(config.allowlist)};
  var __blockedPatterns = ${JSON.stringify(patternSources)}.map(function(p) {
    return new RegExp(p.source, p.flags);
  });

  var __safeSearchRules = [
    { pattern: /google\\./i, param: 'safe', value: 'active' },
    { pattern: /bing\\.com/i, param: 'safesearch', value: 'strict' },
    { pattern: /duckduckgo\\.com/i, param: 'kp', value: '1' },
    { pattern: /yahoo\\.com/i, param: 'vm', value: 'r' },
  ];

  var __dangerousProtocols = ['file:', 'data:', 'javascript:', 'blob:', 'about:'];

  function __validateUrl(urlStr) {
    var parsed;
    try { parsed = new URL(urlStr); } catch(e) {
      return { allowed: false, reason: 'Invalid URL' };
    }

    if (__dangerousProtocols.indexOf(parsed.protocol) !== -1) {
      return { allowed: false, reason: 'Protocol "' + parsed.protocol + '" is not allowed' };
    }

    if (__httpsOnly && parsed.protocol !== 'https:') {
      var isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      if (!isLocal) {
        return { allowed: false, reason: 'Only HTTPS URLs are allowed' };
      }
    }

    if (__allowlist && __allowlist.length > 0) {
      var hostname = parsed.hostname.toLowerCase();
      var ok = __allowlist.some(function(d) {
        return hostname === d || hostname.endsWith('.' + d);
      });
      if (!ok) return { allowed: false, reason: 'Domain not in allowlist' };
      return { allowed: true, reason: '' };
    }

    var fullUrl = urlStr.toLowerCase();
    var hn = parsed.hostname.toLowerCase();
    for (var i = 0; i < __blockedPatterns.length; i++) {
      if (__blockedPatterns[i].test(fullUrl) || __blockedPatterns[i].test(hn)) {
        return { allowed: false, reason: 'Domain blocked by safety policy' };
      }
    }

    return { allowed: true, reason: '' };
  }

  function __applySafeSearch(urlStr) {
    if (!__enforceSafeSearch) return urlStr;
    var parsed;
    try { parsed = new URL(urlStr); } catch(e) { return urlStr; }
    for (var i = 0; i < __safeSearchRules.length; i++) {
      if (__safeSearchRules[i].pattern.test(parsed.hostname)) {
        parsed.searchParams.set(__safeSearchRules[i].param, __safeSearchRules[i].value);
        return parsed.toString();
      }
    }
    return urlStr;
  }

  window.fetch = function(input, init) {
    var urlStr = typeof input === 'string' ? input : (input instanceof Request ? input.url : String(input));

    __requestCount++;
    if (__requestCount > __maxRequests) {
      console.log('Blocked: ' + urlStr + ' (Rate limit: max ' + __maxRequests + ' requests per run)');
      return Promise.reject(new Error('Rate limit exceeded: max ' + __maxRequests + ' requests per execution'));
    }

    var result = __validateUrl(urlStr);
    if (!result.allowed) {
      console.log('Blocked: ' + urlStr + ' (' + result.reason + ')');
      return Promise.reject(new Error(result.reason));
    }

    urlStr = __applySafeSearch(urlStr);

    // Prevent following redirects to blocked destinations
    var safeInit = Object.assign({}, init || {}, { redirect: 'error' });

    return __realFetch.call(window, urlStr, safeInit).then(function(response) {
      var contentType = (response.headers.get('content-type') || '').toLowerCase();
      var typeAllowed = __allowedContentTypes.some(function(t) {
        return contentType.indexOf(t) !== -1;
      });
      if (!typeAllowed) {
        console.log('Blocked: Response content-type "' + (contentType || 'missing') + '" is not allowed');
        return Promise.reject(new Error('Response content-type "' + (contentType || 'missing') + '" is not allowed'));
      }

      var contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > __maxResponseSize) {
        console.log('Blocked: Response too large (' + contentLength + ' bytes, max ' + __maxResponseSize + ')');
        return Promise.reject(new Error('Response too large'));
      }

      return response;
    });
  };

  // Lock the wrapper so user code cannot delete or reassign it
  Object.defineProperty(window, 'fetch', { configurable: false, writable: false });
})();
`
}
