/**
 * Unified session ID management.
 * Stores a single session UUID in localStorage so it survives
 * page refreshes and browser restarts.
 *
 * Replaces the two separate systems:
 *   - window._agentSessionId (in api.js)
 *   - sessionIdRef (in ChatInterface.jsx)
 */

const SESSION_KEY = 'ascend_agent_session_id';

/**
 * Get the current session ID, creating one if it doesn't exist.
 * @returns {string} UUID v4 session identifier
 */
export function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Generate a fresh session ID (e.g., for "New Chat").
 * Replaces the existing session in localStorage.
 * @returns {string} New UUID v4 session identifier
 */
export function refreshSessionId() {
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

/**
 * Clear the current session completely.
 */
export function clearSessionId() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Get the current session ID without creating one.
 * @returns {string|null}
 */
export function getCurrentSessionId() {
  return localStorage.getItem(SESSION_KEY);
}
