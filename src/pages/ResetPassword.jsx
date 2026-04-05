import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
    const { uid, token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.post('users/password-reset-confirm/', {
                uid,
                token,
                password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired reset link.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-slate-800 py-12 px-4 shadow-xl sm:rounded-2xl sm:px-10 text-center">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">check_circle</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Password Reset!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Your password has been successfully reset. Redirecting you to login...</p>
                        <Link to="/login" className="text-primary font-bold hover:underline">Click here if not redirected</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl">lock_open</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Set New Password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Choose a strong password you haven't used before.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
                    {error && (
                        <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl flex items-center gap-2">
                            <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                placeholder="Min. 8 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                placeholder="Repeat password"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
