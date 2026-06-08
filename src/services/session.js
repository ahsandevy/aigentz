/**
 * Unified session ID management.
 * Stores a single session UUID in localStorage so it survives
 * page refreshes and browser restarts.
 *
 * Also manages the active ad account ID for cross-device conversation sharing.
 */

const SESSION_KEY = 'ascend_agent_session_id';
const ACCOUNT_KEY = 'ascend_active_account_id';

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

// ═══════════════════════════════════════════════════════════════════
//  AD ACCOUNT ID — shared across components so conversations
//  are scoped to the same Meta ad account for all users/devices.
// ═══════════════════════════════════════════════════════════════════

/**
 * Get the active ad account ID. Defaults to the hardcoded account
 * if none is selected yet. This ensures conversations are scoped
 * per-account, not per-browser.
 * @returns {string}
 */
const DEFAULT_ACCOUNT_ID = 'act_433185882679534';

export function getActiveAccountId() {
  return localStorage.getItem(ACCOUNT_KEY) || DEFAULT_ACCOUNT_ID;
}

/**
 * Set the active ad account ID. Call this when the user selects an account.
 * @param {string} accountId
 */
export function setActiveAccountId(accountId) {
  if (accountId) {
    localStorage.setItem(ACCOUNT_KEY, accountId);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  ACTIVE CONVERSATION ID — survives page refreshes
// ═══════════════════════════════════════════════════════════════════

const CONVERSATION_KEY = 'ascend_active_conversation_id';

export function getActiveConversationId() {
  return localStorage.getItem(CONVERSATION_KEY) || null;
}

export function setActiveConversationId(id) {
  if (id) {
    localStorage.setItem(CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CONVERSATION_KEY);
  }
}

