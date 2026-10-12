// Light/dark theme. /theme-init.js applies it before the first paint; this
// module keeps <html data-theme> and React in sync afterwards.
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'zta-theme';
const listeners = new Set<() => void>();
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function initialTheme(): Theme {
  const applied = document.documentElement.dataset.theme;
  if (applied === 'light' || applied === 'dark') return applied;
  return storedTheme() ?? (systemDark.matches ? 'dark' : 'light');
}

let current: Theme = initialTheme();
document.documentElement.dataset.theme = current;

function apply(theme: Theme): void {
  current = theme;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

// Follow the operating system until the visitor picks a theme themselves.
systemDark.addEventListener('change', (e) => {
  if (!storedTheme()) apply(e.matches ? 'dark' : 'light');
});

export function getTheme(): Theme {
  return current;
}

export function toggleTheme(): void {
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable — the choice lasts until the page is reloaded
  }
  apply(next);
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
