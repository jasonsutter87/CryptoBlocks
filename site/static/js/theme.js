// Theme toggle — shared across pages. Persists to localStorage.
(function(){
  const KEY = 'cb-theme';
  const saved = (() => { try { return localStorage.getItem(KEY); } catch(e){ return null; } })();
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
  }
  function apply(t){
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch(e){}
  }
  window.CBTheme = {
    toggle(){
      const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      apply(cur === 'light' ? 'dark' : 'light');
    },
    set: apply,
    get(){ return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (t){ e.preventDefault(); window.CBTheme.toggle(); }
  });
})();
