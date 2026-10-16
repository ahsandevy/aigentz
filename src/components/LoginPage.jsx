import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasCompletedOnboarding } from '../services/onboarding';
import { Loader2, AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const requestedDesign = new URLSearchParams(window.location.search).get('design');
  const visualDesign = ['aigentz', 'arcs', 'beam', 'horizon', 'rings', 'sky', 'hello'].includes(requestedDesign) ? requestedDesign : 'aigentz';

  if (isAuthenticated) {
    return <Navigate to={hasCompletedOnboarding(user) ? '/dashboard' : '/onboarding'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const signedInUser = await login(email.trim(), password);
      navigate(hasCompletedOnboarding(signedInUser) ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-form-side" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <div className="login-intro">
            <span className="login-eyebrow">YOUR WORKSPACE</span>
            <h1 id="login-title">Welcome back</h1>
            <p>Sign in to see what needs attention and what to do next.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div role="alert" className="login-error"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}

            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" disabled={loading} autoFocus />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" disabled={loading} />
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading && <Loader2 size={17} className="login-spinner" aria-hidden="true" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="login-form-foot">A clearer view of your marketing starts here.</p>
        </div>
      </section>

      <aside className={`login-art login-art--${visualDesign}`} aria-label="AIGENTZ brand visual">
        <div className="login-art-inner">
          <BrandLogo className="login-art-logo" />
        </div>
      </aside>
    </main>
  );
}
