import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './HomePage.jsx';
import { conversationAPI } from '../services/api.js';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' }, logout: vi.fn() }) }));
vi.mock('./homepage/HeroSection', () => ({ default: () => null }));
vi.mock('./homepage/FeatureCards', () => ({ default: () => null }));
vi.mock('./homepage/RecommendationPanel', () => ({ default: () => null }));
vi.mock('./homepage/ConversationSidebar', () => ({ default: ({ onSelect, onNewChat, onDelete }) => <aside>
  <button onClick={() => onSelect({ id: 'a' })}>Chat A</button>
  <button onClick={() => onSelect({ id: 'b' })}>Chat B</button>
  <button onClick={onNewChat}>New Chat</button>
  <button onClick={() => onDelete('a')}>Delete A</button>
</aside> }));
vi.mock('../services/api.js', () => ({ conversationAPI: { get: vi.fn(), create: vi.fn() } }));
vi.mock('../services/explanationPreferences.js', () => ({
  DEFAULT_EXPLANATION_STYLE: 'technical',
  isExplanationStyle: value => ['simple', 'balanced', 'technical'].includes(value),
  explanationPreferenceAPI: {
    getDefault: async () => ({ explanation_style: 'technical' }),
    getConversation: async () => ({ explanation_style: null }),
  },
}));

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output data-testid="url">{location.pathname}</output>
    <button onClick={() => navigate(-1)}>Back</button>
    <button onClick={() => navigate(1)}>Forward</button></>;
}
function openChat(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>
    <Navigation /><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat/:conversationId" element={<HomePage />} />
    </Routes>
  </MemoryRouter>);
}
function response(text = 'Fresh reply') {
  let delivered = false;
  return { ok: true, body: { getReader: () => ({
    read: async () => delivered ? { done: true } : (delivered = true, {
      done: false, value: new TextEncoder().encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`),
    }), cancel: vi.fn(),
  }) } };
}
async function send(text) {
  await waitFor(() => expect(screen.getByRole('textbox').disabled).toBe(false));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: text } });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
}
const requests = () => fetch.mock.calls.filter(([url]) => String(url).includes('/agent/chat'));

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  conversationAPI.get.mockImplementation(async id => ({
    id, thread_id: `thread-${id}`, messages: [{ id: `msg-${id}`, role: 'ai', content: `History ${id}` }],
  }));
  conversationAPI.create.mockImplementation(async (_account, _title, thread) => ({ id: 'created', thread_id: thread }));
  vi.stubGlobal('fetch', vi.fn(async url => String(url).includes('/meta/accounts')
    ? { ok: true, json: async () => ({ data: [] }) } : response()));
});
afterEach(() => vi.unstubAllGlobals());

describe('chat URL and message isolation', () => {
  it('opens / as a fresh draft despite an old browser conversation', async () => {
    localStorage.setItem('ascend_active_conversation_id', 'a');
    openChat();
    await send('New question');
    await screen.findByText('Fresh reply');
    expect(conversationAPI.get).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/chat/created'));
    expect(screen.getByText('New question')).toBeTruthy();
  });

  it('loads the URL conversation on direct entry and refresh', async () => {
    localStorage.setItem('ascend_active_conversation_id', 'b');
    const view = openChat('/chat/a');
    await screen.findByText('History a');
    view.unmount();
    openChat('/chat/a');
    await screen.findByText('History a');
    await send('Continue A');
    await screen.findByText('Fresh reply');
    expect(JSON.parse(requests()[0][1].body).session_id).toBe('thread-a');
  });

  it('switches URL and history with sidebar and browser back/forward', async () => {
    openChat('/chat/a');
    await screen.findByText('History a');
    fireEvent.click(screen.getByText('Chat B'));
    await screen.findByText('History b');
    expect(screen.queryByText('History a')).toBeNull();
    expect(screen.getByTestId('url').textContent).toBe('/chat/b');
    fireEvent.click(screen.getByText('Back'));
    await screen.findByText('History a');
    fireEvent.click(screen.getByText('Forward'));
    await screen.findByText('History b');
    await send('Continue B');
    await screen.findByText('Fresh reply');
    expect(JSON.parse(requests()[0][1].body).session_id).toBe('thread-b');
  });

  it('gives successive new chats different threads and URLs', async () => {
    let count = 0;
    conversationAPI.create.mockImplementation(async (_account, _title, thread) => ({ id: `new-${++count}`, thread_id: thread }));
    openChat();
    await send('First question');
    await screen.findByText('Fresh reply');
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/chat/new-1'));
    fireEvent.click(screen.getByText('New Chat'));
    await waitFor(() => expect(screen.queryByText('First question')).toBeNull());
    await send('Second question');
    await screen.findByText('Fresh reply');
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/chat/new-2'));
    const threads = requests().map(([, options]) => JSON.parse(options.body).session_id);
    expect(new Set(threads).size).toBe(2);
    expect(conversationAPI.get).not.toHaveBeenCalled();
  });

  it('ignores a late history response after switching chats', async () => {
    let resolveA;
    conversationAPI.get.mockImplementation(id => id === 'a' ? new Promise(resolve => { resolveA = resolve; })
      : Promise.resolve({ thread_id: 'thread-b', messages: [{ id: 'b', role: 'ai', content: 'History b' }] }));
    openChat('/chat/a');
    expect(screen.getByRole('textbox').disabled).toBe(true);
    fireEvent.click(screen.getByText('Chat B'));
    await screen.findByText('History b');
    await act(async () => resolveA({ thread_id: 'thread-a', messages: [{ id: 'a', role: 'ai', content: 'Late A' }] }));
    expect(screen.queryByText('Late A')).toBeNull();
    await send('B question');
    await screen.findByText('Fresh reply');
    expect(JSON.parse(requests()[0][1].body).session_id).toBe('thread-b');
  });

  it('blocks sends on a failed history load instead of using another thread', async () => {
    openChat('/chat/a');
    await screen.findByText('History a');
    conversationAPI.get.mockRejectedValue(new Error('Not found'));
    fireEvent.click(screen.getByText('Chat B'));
    await screen.findByRole('alert');
    expect(screen.queryByText('History a')).toBeNull();
    expect(screen.getByRole('textbox').disabled).toBe(true);
    expect(requests()).toHaveLength(0);
  });

  it('does not send an untracked chat when creation fails and allows retry', async () => {
    conversationAPI.create.mockRejectedValueOnce(new Error('Unavailable'));
    openChat();
    await send('Retry question');
    await screen.findByRole('alert');
    expect(requests()).toHaveLength(0);
    expect(screen.getByTestId('url').textContent).toBe('/');
    await send('Retry question');
    await screen.findByText('Fresh reply');
    await waitFor(() => expect(screen.getByTestId('url').textContent).toBe('/chat/created'));
  });

  it('ignores creation finishing after the user starts another chat', async () => {
    let resolveCreate;
    conversationAPI.create.mockImplementation(() => new Promise(resolve => { resolveCreate = resolve; }));
    openChat();
    await send('Abandoned question');
    fireEvent.click(screen.getByText('New Chat'));
    await act(async () => resolveCreate({ id: 'abandoned', thread_id: 'abandoned-thread' }));
    expect(screen.getByTestId('url').textContent).toBe('/');
    expect(requests()).toHaveLength(0);
    expect(screen.queryByText('Abandoned question')).toBeNull();
  });

  it('returns to a fresh draft when the active chat is deleted', async () => {
    openChat('/chat/a');
    await screen.findByText('History a');
    fireEvent.click(screen.getByText('Delete A'));
    expect(screen.getByTestId('url').textContent).toBe('/');
    expect(screen.queryByText('History a')).toBeNull();
  });

  it('aborts a previous stream and ignores its late reply after navigation', async () => {
    let resolveRead;
    const cancel = vi.fn();
    fetch.mockImplementation(async url => String(url).includes('/meta/accounts')
      ? { ok: true, json: async () => ({ data: [] }) }
      : { ok: true, body: { getReader: () => ({
        read: () => new Promise(resolve => { resolveRead = resolve; }), cancel,
      }) } });
    openChat('/chat/a');
    await screen.findByText('History a');
    await send('A streaming question');
    await waitFor(() => expect(resolveRead).toBeTypeOf('function'));
    const signal = requests()[0][1].signal;
    fireEvent.click(screen.getByText('Chat B'));
    await screen.findByText('History b');
    expect(signal.aborted).toBe(true);
    expect(cancel).toHaveBeenCalled();
    await act(async () => resolveRead({ done: false,
      value: new TextEncoder().encode('data: {"type":"text","content":"Late stream A"}\n\n'),
    }));
    expect(screen.queryByText('Late stream A')).toBeNull();
    expect(screen.queryByText('A streaming question')).toBeNull();
    expect(screen.getByRole('textbox').disabled).toBe(false);
  });
});
