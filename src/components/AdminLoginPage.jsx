import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuth';
import { Lock, Loader2 } from 'lucide-react';

const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminAuthService.login(email);
            navigate('/admin/training-data');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f4f8fe] to-white flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-slate-800 text-2xl font-bold mb-2">
                        Admin Access
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Training Data Management
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-medium mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 flex items-start">
                            <div className="text-red-600 text-sm">{error}</div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className={`w-full py-3.5 rounded-lg text-white font-semibold text-base transition-all flex items-center justify-center gap-2
                            ${loading || !email
                                ? 'bg-slate-400 cursor-not-allowed opacity-70'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                            }`}
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-500 text-xs text-center leading-relaxed">
                        <strong className="text-slate-700">Note:</strong> Only authorized admin emails can access this area. Contact your system administrator if you need access.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
