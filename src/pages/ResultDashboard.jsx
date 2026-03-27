import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResultDashboard() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await api.get('exams/submissions/my_results/');
            setSubmissions(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch results", err);
            setError("Could not load your exam results. Make sure you are logged in.");
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading your results...</p>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-xl flex items-center justify-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                <span className="font-bold text-lg">{error}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">My Exam Results</h2>
                        <p className="text-slate-500 dark:text-slate-400">Review your past performance and feedback.</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Dashboard
                    </button>
                </div>

                {submissions.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">sentiment_dissatisfied</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Results Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            You haven't completed any exams yet or your exams haven't been graded by the instructor.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exam Title</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted On</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-primary">{sub.exam_title || `Exam #${sub.exam}`}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    {new Date(sub.end_time || sub.start_time).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${sub.status === 'GRADED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    sub.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-black text-slate-900 dark:text-white text-lg">
                                                    {sub.score !== null ? sub.score : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {sub.passed === true && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-sm shadow-green-500/20">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        Passed
                                                    </span>
                                                )}
                                                {sub.passed === false && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-500/20">
                                                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                                                        Failed
                                                    </span>
                                                )}
                                                {sub.passed === null && (
                                                    <span className="text-slate-400 dark:text-slate-500 italic text-sm font-medium">Pending grading</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
