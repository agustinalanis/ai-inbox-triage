const KEY = 'demo-session'

let memorySession: string | undefined

/** The anonymous demo session: one UUID per browser, so each visitor gets their own inbox. */
export function getSessionId(): string {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    localStorage.setItem(KEY, created)
    return created
  } catch {
    // Storage blocked (private mode, disabled site data): keep one id for this page load.
    memorySession ??= crypto.randomUUID()
    return memorySession
  }
}
