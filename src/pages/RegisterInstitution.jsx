import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterInstitution() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'INSTITUTION',
        institution_name: '',
        institution_address: '',
        institution_phone: '',
        institution_website: ''
    });
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!formData.institution_name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.username.length < 3) {
            setError('Admin username must be at least 3 characters long');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid institution email');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            await api.post('users/register/', formData);
            navigate('/login');
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                // Handle DRF validation errors
                const firstError = Object.values(data)[0];
                if (Array.isArray(firstError)) {
                    setError(firstError[0]);
                } else if (typeof firstError === 'string') {
                    setError(firstError);
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError('Registration failed. Please check your inputs.');
                }
            } else {
                setError('Registration failed. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl">apartment</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Register your Institution
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">Sign in here</Link>
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

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution Name</label>
                            <input
                                type="text"
                                name="institution_name"
                                required
                                onChange={handleChange}
                                className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                placeholder="e.g. Oxford University"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                onChange={handleChange}
                                className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Official Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                onChange={handleChange}
                                className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                placeholder="admin@institution.edu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    onChange={handleChange}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 pr-10 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                    placeholder="Create a strong password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institution Address</label>
                            <textarea
                                name="institution_address"
                                rows="2"
                                onChange={handleChange}
                                className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors resize-none"
                                placeholder="Full postal address"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="institution_phone"
                                    onChange={handleChange}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                    placeholder="+1 234 567 890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                                <input
                                    type="url"
                                    name="institution_website"
                                    onChange={handleChange}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                    placeholder="https://institution.edu"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-xl border border-transparent bg-primary py-3 px-4 text-sm font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-[1.02]"
                            >
                                Register Institution
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
