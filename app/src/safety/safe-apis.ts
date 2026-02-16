/**
 * Generates JavaScript code that disables or restricts dangerous browser APIs
 * inside the sandbox iframe. Complements the fetch/WebSocket wrappers.
 * All overrides are locked with Object.defineProperty to prevent reassignment.
 */
export function generateSafeApisCode(): string {
  return `
;(function() {
  // Block XMLHttpRequest (locked)
  Object.defineProperty(window, 'XMLHttpRequest', {
    value: function() {
      throw new Error('XMLHttpRequest is disabled. Use fetch() instead.');
    },
    configurable: false,
    writable: false,
  });

  // Block navigator.sendBeacon on the prototype (prevents .call/.apply bypass)
  Object.defineProperty(Navigator.prototype, 'sendBeacon', {
    value: function() {
      console.log('Blocked: navigator.sendBeacon is disabled');
      return false;
    },
    configurable: false,
    writable: false,
  });

  // Block EventSource (locked)
  Object.defineProperty(window, 'EventSource', {
    value: function() {
      throw new Error('EventSource is disabled');
    },
    configurable: false,
    writable: false,
  });

  // Block Worker / SharedWorker constructors (locked)
  Object.defineProperty(window, 'Worker', {
    value: function() {
      throw new Error('Web Workers are disabled');
    },
    configurable: false,
    writable: false,
  });
  Object.defineProperty(window, 'SharedWorker', {
    value: function() {
      throw new Error('SharedWorkers are disabled');
    },
    configurable: false,
    writable: false,
  });
  if (navigator.serviceWorker) {
    Object.defineProperty(navigator, 'serviceWorker', {
      get: function() { return undefined; },
      configurable: false,
    });
  }

  // Rate-limit alert/confirm/prompt (max 3 per execution, locked)
  var __modalCount = 0;
  var __maxModals = 3;
  var __realAlert = window.alert;
  var __realConfirm = window.confirm;
  var __realPrompt = window.prompt;

  Object.defineProperty(window, 'alert', {
    value: function(msg) {
      __modalCount++;
      if (__modalCount > __maxModals) {
        console.log('Blocked: Too many dialog boxes (max ' + __maxModals + ')');
        return;
      }
      return __realAlert.call(window, msg);
    },
    configurable: false,
    writable: false,
  });
  Object.defineProperty(window, 'confirm', {
    value: function(msg) {
      __modalCount++;
      if (__modalCount > __maxModals) {
        console.log('Blocked: Too many dialog boxes (max ' + __maxModals + ')');
        return false;
      }
      return __realConfirm.call(window, msg);
    },
    configurable: false,
    writable: false,
  });
  Object.defineProperty(window, 'prompt', {
    value: function(msg, def) {
      __modalCount++;
      if (__modalCount > __maxModals) {
        console.log('Blocked: Too many dialog boxes (max ' + __maxModals + ')');
        return null;
      }
      return __realPrompt.call(window, msg, def);
    },
    configurable: false,
    writable: false,
  });
})();
`
}
