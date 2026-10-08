import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  DEFAULT_EXPLANATION_STYLE, explanationPreferenceAPI, isExplanationStyle,
} from '../services/explanationPreferences.js';

const initialState = {
  style: DEFAULT_EXPLANATION_STYLE, savedStyle: DEFAULT_EXPLANATION_STYLE,
  override: null, pending: undefined, loading: true, saving: false, unavailable: false, error: '',
};
const mergeState = (state, update) => update.reset
  ? { ...initialState, ...update, reset: undefined }
  : { ...state, ...update };

const conversationUnavailable = (error) => [403, 404].includes(error?.response?.status);
const unavailableMessage = 'This conversation is no longer available. Select another conversation or start a new chat.';

function conversationPreference(conversation, savedStyle) {
  const override = isExplanationStyle(conversation?.explanation_style)
    ? conversation.explanation_style : null;
  return {
    override,
    style: isExplanationStyle(conversation?.effective_explanation_style)
      ? conversation.effective_explanation_style : override || savedStyle,
  };
}

/** Owns preference persistence; pending changes are only sent until acknowledged. */
export function useExplanationPreferences({ userId, conversationId }) {
  const [state, dispatch] = useReducer(mergeState, initialState);
  const scopeRef = useRef(null);
  const createdRef = useRef(null);
  const key = JSON.stringify([userId, conversationId]);

  useEffect(() => {
    const controller = new AbortController();
    const scope = { key, userId, conversationId, controller };
    scopeRef.current = scope;
    const created = createdRef.current;
    if (created?.userId === userId && created.conversation.id === conversationId) {
      createdRef.current = null;
      dispatch({ ...created.state, key, ...conversationPreference(created.conversation, created.state.savedStyle), loading: false });
    } else {
      createdRef.current = null;
      dispatch({ reset: true, key, loading: Boolean(userId) });
      if (userId) {
        void Promise.allSettled([
          explanationPreferenceAPI.getDefault(controller.signal),
          conversationId ? explanationPreferenceAPI.getConversation(conversationId, controller.signal) : Promise.resolve(null),
        ]).then(([defaultResult, conversationResult]) => {
          if (controller.signal.aborted || scopeRef.current !== scope || scope.preferenceReceived) return;
          const savedStyle = defaultResult.status === 'fulfilled' && isExplanationStyle(defaultResult.value?.explanation_style)
            ? defaultResult.value.explanation_style : DEFAULT_EXPLANATION_STYLE;
          const conversation = conversationResult.status === 'fulfilled' ? conversationResult.value : null;
          const unavailable = conversationResult.status === 'rejected' && conversationUnavailable(conversationResult.reason);
          dispatch({
            savedStyle, ...conversationPreference(conversation, savedStyle), loading: false, unavailable,
            error: unavailable ? unavailableMessage : defaultResult.status === 'rejected' || conversationResult.status === 'rejected'
              ? 'Could not load explanation preferences. You can choose a style for your next message.' : '',
          });
        });
      }
    }
    return () => { controller.abort(); };
  }, [key, userId, conversationId]);

  const changeOverride = useCallback(async (style) => {
    if (style !== null && !isExplanationStyle(style)) return;
    const scope = scopeRef.current;
    if (!userId || !scope || scope.key !== key || state.loading || state.saving || state.unavailable) return;
    dispatch({ style: style || state.savedStyle, override: style, pending: style, error: '' });
    if (!conversationId) return;
    dispatch({ saving: true });
    try {
      const conversation = await explanationPreferenceAPI.saveConversation(conversationId, style, scope.controller.signal);
      if (scope.controller.signal.aborted || scopeRef.current !== scope) return;
      dispatch({ ...conversationPreference(conversation, state.savedStyle), pending: undefined, saving: false });
    } catch (error) {
      if (scope.controller.signal.aborted || scopeRef.current !== scope) return;
      if (conversationUnavailable(error)) {
        dispatch({ saving: false, unavailable: true, pending: undefined, error: unavailableMessage });
        return;
      }
      dispatch({ saving: false, error: 'Could not save this conversation’s style. Your selection will be retried with your next message.' });
    }
  }, [userId, key, state.loading, state.saving, state.savedStyle, state.unavailable, conversationId]);

  const saveDefault = useCallback(async () => {
    const scope = scopeRef.current;
    if (!userId || !scope || scope.key !== key || state.loading || state.saving) return;
    dispatch({ saving: true, error: '' });
    try {
      const result = await explanationPreferenceAPI.saveDefault(state.style, scope.controller.signal);
      if (scope.controller.signal.aborted || scopeRef.current !== scope) return;
      const savedStyle = isExplanationStyle(result.explanation_style) ? result.explanation_style : state.style;
      dispatch({ savedStyle, saving: false });
    } catch {
      if (scope.controller.signal.aborted || scopeRef.current !== scope) return;
      dispatch({ saving: false, error: 'Could not save your default. Your current conversation selection is unchanged.' });
    }
  }, [userId, key, state.loading, state.saving, state.style]);

  const getRequestFields = useCallback(() => {
    if (!userId || state.key !== key || state.pending === undefined) return {};
    return state.pending === null ? { reset_explanation_style: true } : { explanation_style: state.pending };
  }, [state.pending, state.key, key, userId]);

  const adoptConversation = useCallback((conversation) => {
    createdRef.current = { userId, conversation, state };
  }, [userId, state]);

  const applyPresentationEvent = useCallback((event, streamConversationId) => {
    const scope = scopeRef.current;
    const created = createdRef.current;
    const matchesConversation = scope?.conversationId === streamConversationId
      || (created?.userId === userId && created.conversation.id === streamConversationId);
    if (!scope || scope.userId !== userId || scope.controller.signal.aborted || !matchesConversation
      || event.type !== 'presentation_preference' || !isExplanationStyle(event.explanation_style)) return;
    scope.preferenceReceived = true;
    const update = {
      style: event.explanation_style,
      override: isExplanationStyle(event.conversation_explanation_style) ? event.conversation_explanation_style : null,
      ...(isExplanationStyle(event.saved_explanation_style) ? { savedStyle: event.saved_explanation_style } : {}),
      pending: event.conversation_saved === false && ['message', 'selector'].includes(event.source)
        ? (event.conversation_explanation_style === null ? null : event.explanation_style) : undefined,
      error: event.warning || '', loading: false,
    };
    // Creation can hand the conversation to the parent before its rerender commits.
    if (created?.userId === userId && created.conversation.id === streamConversationId) {
      created.state = { ...created.state, ...update };
      created.conversation = { ...created.conversation, explanation_style: update.override, effective_explanation_style: update.style };
    }
    dispatch(update);
  }, [userId]);

  return {
    ...(state.key === key ? state : { ...initialState, loading: Boolean(userId) }),
    changeStyle: changeOverride, useDefault: () => changeOverride(null), saveDefault,
    getRequestFields, adoptConversation, applyPresentationEvent,
  };
}
