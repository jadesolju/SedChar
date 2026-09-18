try {
  const stored = localStorage.getItem('sedchar-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (stored === 'dark' || (!stored && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
} catch (_) {}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    for (var r of regs) { r.unregister(); }
  });
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (var n of names) { caches.delete(n); }
    });
  }
}
