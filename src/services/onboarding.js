const keyFor = (user) => `ascend:onboarding:v1:${user?.email?.toLowerCase() || user?.id || 'account'}`

export function hasCompletedOnboarding(user) {
  try {
    return JSON.parse(localStorage.getItem(keyFor(user)))?.completed === true
  } catch {
    return false
  }
}

export function saveOnboarding(user, preferences) {
  localStorage.setItem(keyFor(user), JSON.stringify({ ...preferences, completed: true }))
}
