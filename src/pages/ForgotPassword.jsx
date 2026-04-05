import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        try {
            const response = await api.post('users/password-reset/', { email });
            setMessage(response.data.detail);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl">lock_reset</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Forgot your password?
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
                    {message && (
                        <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined shrink-0 text-xl">check_circle</span>
                            <span className="text-sm font-medium">{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                    placeholder="Enter your registered email"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Sending link...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
