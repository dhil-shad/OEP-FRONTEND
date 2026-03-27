import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GradingDashboard() {
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const res = await api.get('exams/');
            setExams(res.data);
            if (res.data.length > 0) {
                setSelectedExam(res.data[0].id);
                fetchSubmissions(res.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError("Failed to fetch exams");
            setLoading(false);
        }
    };

    const fetchSubmissions = async (examId) => {
        setLoading(true);
        try {
            const res = await api.get(`exams/${examId}/submissions/`);
            setSubmissions(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch submissions");
            setLoading(false);
        }
    };

    const handleExamChange = (e) => {
        const examId = e.target.value;
        setSelectedExam(examId);
        fetchSubmissions(examId);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Grading Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400">Review and grade student submissions.</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Dashboard
                    </button>
                </div>

                {error && (
                    <div className="mb-8 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                        <span className="font-bold text-sm">{error}</span>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Exam to Grade</label>
                        <div className="relative">
                            <select
                                value={selectedExam}
                                onChange={handleExamChange}
                                disabled={loading && exams.length === 0}
                                className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer pr-10"
                            >
                                {exams.length === 0 ? (
                                    <option>No exams available</option>
                                ) : (
                                    exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.title}
                                        </option>
                                    ))
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                <span className="material-symbols-outlined text-xl">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium text-sm">Loading submissions...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">inbox</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Submissions Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            No students have submitted this exam yet.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted On</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                        <th className="py-4 px-6 font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {submissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                                                        {sub.student_name ? sub.student_name.charAt(0) : '?'}
                                                    </div>
                                                    {sub.student_name || 'Unknown Student'}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    {new Date(sub.end_time || sub.start_time).toLocaleString()}
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
                                                <div className="font-black text-slate-900 dark:text-white">
                                                    {sub.score !== null ? sub.score : <span className="text-slate-400">-</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/exams/${selectedExam}/grade/${sub.id}`)}
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors ${sub.status === 'GRADED'
                                                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'
                                                            : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {sub.status === 'GRADED' ? 'visibility' : 'edit_document'}
                                                    </span>
                                                    {sub.status === 'GRADED' ? 'Review Grades' : 'Grade Submission'}
                                                </button>
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
