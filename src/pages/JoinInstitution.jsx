import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function JoinInstitution() {
    const [uid, setUid] = useState('');
    const [enrollment, setEnrollment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingDepts, setFetchingDepts] = useState(false);
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (uid.length === 8) {
            setFetchingDepts(true);
            api.get(`users/public/institutions/${uid}/departments/`)
                .then(res => {
                    setDepartments(res.data);
                    if (res.data.length > 0) {
                        setSelectedDept('');
                        setStatus(null);
                    } else {
                        setStatus({ type: 'error', message: 'No departments found for this institution.' });
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch departments", err);
                    setDepartments([]);
                    setStatus({ type: 'error', message: 'Invalid institution code or no departments available.' });
                })
                .finally(() => setFetchingDepts(false));
        } else {
            setDepartments([]);
            setSelectedDept('');
        }
    }, [uid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDept) {
            setStatus({ type: 'error', message: 'Please select a department.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            await api.post('users/join-institution/', {
                code: uid,
                enrollment_number: enrollment,
                department: selectedDept
            });
            setStatus({ type: 'success', message: 'Your join request has been sent! Waiting for institution approval.' });
            setUid('');
            setEnrollment('');
            setSelectedDept('');
            setDepartments([]);
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to send join request.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">

            <div className="max-w-md w-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 border-4 border-white dark:border-slate-800">
                        <span className="material-symbols-outlined text-4xl text-white">apartment</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mt-4 overflow-hidden">
                    <div className="px-8 pt-12 pb-8">
                        <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2">Join Institution</h2>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-8">
                            Link your student account to your institution by providing your institution code and roll number.
                        </p>

                        {status && (
                            <div className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium ${status.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                                : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                                }`}>
                                <span className="material-symbols-outlined shrink-0 text-xl">
                                    {status.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Institution Code (UID)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={uid}
                                    onChange={(e) => setUid(e.target.value.toUpperCase())}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-mono tracking-widest transition-colors"
                                    placeholder="e.g. A1B2C3D4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Enrollment / Admission Number
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={enrollment}
                                    onChange={(e) => setEnrollment(e.target.value.toUpperCase())}
                                    className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                    placeholder="Enter your student ID or roll number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Select Department
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={departments.length === 0}
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3.5 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{fetchingDepts ? 'Fetching departments...' : departments.length > 0 ? 'Choose a department' : 'Enter a valid UID first'}</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                                        <span className="material-symbols-outlined shrink-0 text-xl">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !uid || !enrollment || !selectedDept}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-4"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">send</span>
                                        Submit Request
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full py-3.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                Cancel & Go Back
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
