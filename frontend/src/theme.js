const THEME_KEY = 'sparkcs_theme'

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system'
}

export function setStoredTheme(v) {
  localStorage.setItem(THEME_KEY, v)
}

export function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(theme) {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return theme
}

export function applyTheme(theme) {
  const t = resolveTheme(theme)
  const html = document.documentElement
  if (t === 'dark') html.setAttribute('data-theme', 'dark')
  else html.removeAttribute('data-theme') // light default
}

export function initTheme() {
  const saved = getStoredTheme()
  applyTheme(saved)
  // React to system changes when in system mode
  const mm = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    if (getStoredTheme() === 'system') applyTheme('system')
  }
  if (mm.addEventListener) mm.addEventListener('change', onChange)
  else if (mm.addListener) mm.addListener(onChange)
}

export function nextTheme(current) {
  const order = ['light', 'dark', 'system']
  const idx = order.indexOf(current)
  return order[(idx + 1) % order.length]
}
