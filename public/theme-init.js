// Runs before the page paints, so the dashboard never flashes the wrong theme.
// A saved choice wins; otherwise follow the operating system.
(function () {
  var theme;
  try {
    theme = localStorage.getItem('zta-theme');
  } catch (e) {
    theme = null;
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
