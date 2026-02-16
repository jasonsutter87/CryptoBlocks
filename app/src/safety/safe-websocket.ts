import type { SafetyConfig } from './types'

/**
 * Generates JavaScript code that overrides window.WebSocket with a safety-wrapped
 * version. Intended to be injected into the sandbox iframe before user code runs.
 */
export function generateSafeWebSocketCode(config: SafetyConfig): string {
  const patternSources = config.blockedPatterns.map((p) => ({
    source: p.source,
    flags: p.flags,
  }))

  return `
;(function() {
  var __RealWebSocket = window.WebSocket;
  var __wssOnly = ${config.wssOnly};
  var __allowlist = ${JSON.stringify(config.allowlist)};
  var __wsCount = 0;
  var __maxWsConnections = ${config.maxRequestsPerExecution};
  var __blockedPatterns = ${JSON.stringify(patternSources)}.map(function(p) {
    return new RegExp(p.source, p.flags);
  });

  function SafeWebSocket(url, protocols) {
    __wsCount++;
    if (__wsCount > __maxWsConnections) {
      console.log('Blocked: ' + url + ' (WebSocket connection limit: max ' + __maxWsConnections + ')');
      throw new Error('WebSocket connection limit exceeded');
    }
    var parsed;
    try { parsed = new URL(url); } catch(e) {
      throw new Error('Invalid WebSocket URL');
    }

    if (__wssOnly && parsed.protocol !== 'wss:') {
      var isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      if (!isLocal) {
        console.log('Blocked: ' + url + ' (Only WSS connections are allowed)');
        throw new Error('Only WSS (secure) WebSocket connections are allowed');
      }
    }

    if (__allowlist && __allowlist.length > 0) {
      var hostname = parsed.hostname.toLowerCase();
      var ok = __allowlist.some(function(d) {
        return hostname === d || hostname.endsWith('.' + d);
      });
      if (!ok) {
        console.log('Blocked: ' + url + ' (Domain not in allowlist)');
        throw new Error('Domain not in allowlist');
      }
    } else {
      var fullUrl = url.toLowerCase();
      var hn = parsed.hostname.toLowerCase();
      for (var i = 0; i < __blockedPatterns.length; i++) {
        if (__blockedPatterns[i].test(fullUrl) || __blockedPatterns[i].test(hn)) {
          console.log('Blocked: ' + url + ' (Domain blocked by safety policy)');
          throw new Error('Domain blocked by safety policy');
        }
      }
    }

    if (protocols !== undefined) {
      return new __RealWebSocket(url, protocols);
    }
    return new __RealWebSocket(url);
  }

  SafeWebSocket.CONNECTING = __RealWebSocket.CONNECTING;
  SafeWebSocket.OPEN = __RealWebSocket.OPEN;
  SafeWebSocket.CLOSING = __RealWebSocket.CLOSING;
  SafeWebSocket.CLOSED = __RealWebSocket.CLOSED;
  SafeWebSocket.prototype = __RealWebSocket.prototype;

  Object.defineProperty(window, 'WebSocket', {
    value: SafeWebSocket,
    configurable: false,
    writable: false,
  });
})();
`
}
