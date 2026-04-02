import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function ManageExam() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        question_type: 'MCQ',
        marks: 1.0,
        options: [{ text: '', is_correct: false }, { text: '', is_correct: false }]
    });
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [emailsInput, setEmailsInput] = useState('');
    const [invitesLoading, setInvitesLoading] = useState(false);

    // Analytics
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchExamDetails();
        // If redirected from CreateExam, auto-open the question form
        if (location.state?.openQuestionForm) {
            setShowQuestionForm(true);
        }
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            const res = await api.get(`exams/${id}/`);
            // Convert UTC ISO to local YYYY-MM-DDTHH:MM for the datetime-local input
            const toLocalDatetime = (dateStr) => {
                const d = new Date(dateStr);
                const offset = d.getTimezoneOffset() * 60000;
                return new Date(d.getTime() - offset).toISOString().slice(0, 16);
            };
            setExam({
                ...res.data,
                start_time: toLocalDatetime(res.data.start_time),
                end_time: toLocalDatetime(res.data.end_time)
            });
            fetchAnalytics();
        } catch (err) {
            setError('Failed to fetch exam details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get(`exams/${id}/analytics/`);
            setAnalytics(res.data);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        }
    };

    const toggleActiveStatus = async () => {
        // Block publishing if exam has no questions
        if (!exam.is_active && (!exam.questions || exam.questions.length === 0)) {
            alert('Cannot publish this exam. Please add at least one question before publishing.');
            return;
        }
        try {
            // When toggling, send the current local times back as UTC ISO strings
            const updateData = {
                is_active: !exam.is_active,
                start_time: new Date(exam.start_time).toISOString(),
                end_time: new Date(exam.end_time).toISOString()
            };
            await api.patch(`exams/${id}/`, updateData);
            setExam({ ...exam, is_active: !exam.is_active });
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to update exam status');
        }
    };

    const handleGenerateInvites = async () => {
        if (!emailsInput.trim()) return alert("Please enter at least one email.");
        const emails = emailsInput.split(',').map(e => e.trim()).filter(e => e);
        if (emails.length === 0) return alert("Invalid emails format. Separate by comma.");

        setInvitesLoading(true);
        try {
            const res = await api.post(`exams/${id}/generate_invites/`, { emails });
            alert(res.data.detail);
            setEmailsInput('');
            fetchExamDetails();
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to generate invites");
        } finally {
            setInvitesLoading(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const res = await api.get(`exams/${id}/download_report/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `exam_report_${id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Failed to download report");
        }
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        if (name === 'question_type' && value === 'TF') {
            setNewQuestion({
                ...newQuestion,
                [name]: value,
                options: [
                    { text: 'True', is_correct: false },
                    { text: 'False', is_correct: false }
                ]
            });
        } else {
            setNewQuestion({ ...newQuestion, [name]: value });
        }
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index][field] = value;
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const addOptionField = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { text: '', is_correct: false }]
        });
    };

    const handleEditQuestion = (q) => {
        setNewQuestion({
            text: q.text,
            question_type: q.question_type,
            marks: q.marks,
            options: q.options.map(opt => ({ ...opt })) // deep copy options
        });
        setEditingQuestionId(q.id);
        setShowQuestionForm(true);
        // Scroll to form
        setTimeout(() => {
            document.getElementById('question-form-scroll')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleDeleteQuestion = async (qId) => {
        if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) return;
        try {
            await api.delete(`exams/${id}/questions/${qId}/`);
            fetchExamDetails();
        } catch (err) {
            alert('Failed to delete question');
        }
    };

    const resetQuestionForm = () => {
        setNewQuestion({
            text: '',
            question_type: 'MCQ',
            marks: 1.0,
            options: [{ text: '', is_correct: false }, { text: '', is_correct: false }]
        });
        setEditingQuestionId(null);
    };

    const submitQuestion = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newQuestion };

            if (payload.question_type === 'MCQ' || payload.question_type === 'TF') {
                const hasCorrectOption = payload.options.some(opt => opt.is_correct === true);
                if (!hasCorrectOption) {
                    alert('Please select the correct answer by checking the button next to it.');
                    return;
                }
                const hasEmptyOption = payload.options.some(opt => !opt.text.trim());
                if (hasEmptyOption) {
                    alert('Please ensure all options have text.');
                    return;
                }
            } else if (payload.question_type === 'DESC' || payload.question_type === 'CODE') {
                payload.options = [];
            }

            if (editingQuestionId) {
                await api.patch(`exams/${id}/questions/${editingQuestionId}/`, payload);
            } else {
                await api.post(`exams/${id}/questions/`, payload);
            }

            if (e.nativeEvent.submitter?.name !== 'save_add_another') {
                setShowQuestionForm(false);
            }
            fetchExamDetails();
            resetQuestionForm();
        } catch (err) {
            alert(editingQuestionId ? 'Failed to update question' : 'Failed to add question');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading exam details...</p>
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
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{exam.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{exam.description || 'No description provided.'}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300">
                                Exam Code: {exam.unique_code}
                            </span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/exam/join/${exam.unique_code}`);
                                    alert('Exam join link copied to clipboard!');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[14px]">link</span> Copy Link
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Dashboard
                    </button>
                </div>

                {/* Exam Details Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exam Details</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div>
                                <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Duration</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{exam.duration_minutes} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">mins</span></span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Pass Percentage</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{exam.pass_percentage}<span className="text-sm font-bold text-slate-500 dark:text-slate-400">%</span></span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Questions</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{exam.questions?.length || 0}</span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</span>
                                <div className="flex items-center gap-3 h-8">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase whitespace-nowrap ${exam.status === 'Live' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        exam.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            exam.status === 'Ended' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                        {exam.status}
                                    </span>
                                    {exam.status !== 'Ended' && (
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Published</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={exam.is_active} onChange={toggleActiveStatus} />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Start Time</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {new Date(exam.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="material-symbols-outlined text-rose-500">event_busy</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">End Time</span>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {new Date(exam.end_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {exam.proctoring && (
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                <h4 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-4">
                                    Proctoring Configuration <span className="material-symbols-outlined text-amber-500 text-lg">shield_lock</span>
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Webcam Snapshots</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${exam.proctoring.webcam_enabled ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {exam.proctoring.webcam_enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Screen Recording</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${exam.proctoring.screen_record_enabled ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {exam.proctoring.screen_record_enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Full Screen Mode</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${exam.proctoring.full_screen_enforced ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {exam.proctoring.full_screen_enforced ? 'Enforced' : 'Relaxed'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Violation Tolerance</span>
                                        <span className="text-lg font-bold text-rose-500">{exam.proctoring.tolerance_count} <span className="text-sm font-semibold">Warnings</span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Analytics Dashboard */}
                {analytics && analytics.total_submissions > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-green-500 mb-8 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Performance Analytics</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Insights based on {analytics.total_submissions} completed submission(s).</p>
                                </div>
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Download Full Report (CSV)
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 text-center">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-2">Pass Rate</h4>
                                    <div className="text-4xl font-black text-green-500 mb-3">{analytics.pass_ratio}%</div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${analytics.pass_ratio}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 text-center">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-2">Average Score</h4>
                                    <div className="text-4xl font-black text-primary mb-3">{analytics.average_score}</div>
                                    <div className="flex justify-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                        <span>Min: <span className="text-slate-800 dark:text-slate-200">{analytics.lowest_score}</span></span>
                                        <span>Max: <span className="text-slate-800 dark:text-slate-200">{analytics.highest_score}</span></span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 text-center">
                                    <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-2">Fail Rate</h4>
                                    <div className="text-4xl font-black text-rose-500 mb-3">{analytics.fail_ratio}%</div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                        <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${analytics.fail_ratio}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {analytics.question_difficulty?.length > 0 && (
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm">Question Difficulty (Objective Questions Only)</h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Question Snippet</th>
                                                    <th className="px-4 py-3 font-semibold text-center">Difficulty</th>
                                                    <th className="px-4 py-3 font-semibold text-right">Correct Answers</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                {analytics.question_difficulty.map(q => (
                                                    <tr key={q.question_id} className="bg-white dark:bg-slate-800">
                                                        <td className="px-4 py-3 truncate max-w-xs text-slate-700 dark:text-slate-300" title={q.question_text}>{q.question_text}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-1.5 rounded-full ${q.difficulty > 60 ? 'bg-rose-500' : (q.difficulty > 30 ? 'bg-amber-500' : 'bg-green-500')}`}
                                                                        style={{ width: `${q.difficulty}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-500 w-8">{q.difficulty}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300">{q.correct_ratio}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Invites Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-primary mb-8 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Candidate Invites</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Generate unique secure links for candidates to take this exam.</p>

                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="text"
                                className="flex-grow appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                placeholder="candy@test.com, dandy@test.com"
                                value={emailsInput}
                                onChange={(e) => setEmailsInput(e.target.value)}
                            />
                            <button
                                onClick={handleGenerateInvites}
                                disabled={invitesLoading}
                                className="flex items-center justify-center whitespace-nowrap bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {invitesLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    'Generate Links'
                                )}
                            </button>
                        </div>

                        {exam.invites?.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 text-sm">Active Invites</h4>
                                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Email</th>
                                                <th className="px-4 py-3 font-semibold">Invite Link</th>
                                                <th className="px-4 py-3 font-semibold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {exam.invites.map(inv => (
                                                <tr key={inv.id} className="bg-white dark:bg-slate-800">
                                                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{inv.email}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex rounded-md shadow-sm">
                                                            <input
                                                                type="text"
                                                                className="flex-1 min-w-0 block w-full px-3 py-1.5 rounded-none rounded-l-md sm:text-sm border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono text-xs cursor-text focus:ring-0 focus:outline-none"
                                                                readOnly
                                                                value={`${window.location.origin}/exam/invite/${inv.token}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/exam/invite/${inv.token}`)}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-r-md border border-l-0 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-xs transition-colors"
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${inv.is_used ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                            {inv.is_used ? 'Used' : 'Pending'}
                                                        </span>
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

                {/* Questions Section */}
                <div className="flex justify-between items-center mb-6 mt-12">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Questions</h3>
                    {exam.status !== 'Ended' && (
                        <button
                            onClick={() => setShowQuestionForm(!showQuestionForm)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${showQuestionForm ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}
                        >
                            {showQuestionForm ? 'Cancel' : '+ Add Question'}
                        </button>
                    )}
                </div>

                {showQuestionForm && (
                    <div id="question-form-scroll" className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 mb-8 overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                {editingQuestionId ? 'Edit Question' : 'New Question Form'}
                            </h4>
                            {editingQuestionId && (
                                <button onClick={resetQuestionForm} className="text-sm font-bold text-slate-500 hover:text-rose-500 transition-colors flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">close</span> Cancel Edit
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            <form onSubmit={submitQuestion}>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Question Text</label>
                                    <textarea
                                        name="text"
                                        required
                                        rows={3}
                                        value={newQuestion.text}
                                        onChange={handleQuestionChange}
                                        className="block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Enter the question here..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                        <div className="relative">
                                            <select
                                                name="question_type"
                                                value={newQuestion.question_type}
                                                onChange={handleQuestionChange}
                                                className="block w-full appearance-none rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white pr-10 cursor-pointer"
                                            >
                                                <option value="MCQ">Multiple Choice</option>
                                                <option value="TF">True/False</option>
                                                <option value="DESC">Descriptive</option>
                                                <option value="CODE">Coding</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                                <span className="material-symbols-outlined text-xl">expand_more</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Marks</label>
                                        <input
                                            type="number"
                                            name="marks"
                                            required
                                            step="0.5"
                                            value={newQuestion.marks}
                                            onChange={handleQuestionChange}
                                            className="block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {(newQuestion.question_type === 'MCQ' || newQuestion.question_type === 'TF') && (
                                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Options</label>
                                            {newQuestion.question_type === 'MCQ' && (
                                                <button
                                                    type="button"
                                                    onClick={addOptionField}
                                                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    + Add Option
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-rose-500 mb-4">
                                            * Ensure you check the radio button to select the correct answer.
                                        </p>
                                        <div className="space-y-3">
                                            {newQuestion.options.map((opt, idx) => (
                                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${opt.is_correct ? 'border-green-500 bg-green-50/10 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                                    <input
                                                        type="radio"
                                                        name="correct_option"
                                                        checked={opt.is_correct}
                                                        onChange={() => {
                                                            const updated = newQuestion.options.map((o, i) => ({ ...o, is_correct: i === idx }));
                                                            setNewQuestion({ ...newQuestion, options: updated });
                                                        }}
                                                        id={`option-radio-${idx}`}
                                                        className="w-5 h-5 text-green-500 border-slate-300 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700 border-2 bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder={`Option ${idx + 1}`}
                                                        value={opt.text}
                                                        onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                                                        disabled={newQuestion.question_type === 'TF'}
                                                        className="flex-grow bg-transparent border-none p-0 focus:ring-0 text-slate-900 dark:text-white sm:text-sm disabled:opacity-50"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end gap-3">
                                    {!editingQuestionId && (
                                        <button
                                            type="submit"
                                            name="save_add_another"
                                            className="px-6 py-3 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            Save & Add Another
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        name="save"
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
                                    >
                                        {editingQuestionId ? 'Update Question' : 'Save Question'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {exam.questions?.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">quiz</span>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No questions added yet.</p>
                        </div>
                    ) : (
                        exam.questions?.map((q, idx) => (
                            <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Q{idx + 1} • {q.question_type}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 uppercase tracking-wider">
                                        {q.marks} Marks
                                    </span>
                                    {exam.status !== 'Ended' && (
                                        <div className="ml-auto flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditQuestion(q)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                title="Edit Question"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                                                title="Delete Question"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h5 className="text-lg font-medium text-slate-900 dark:text-white mb-4 whitespace-pre-wrap">{q.text}</h5>

                                {q.options && q.options.length > 0 && (
                                    <div className="pl-4 border-l-4 border-slate-200 dark:border-slate-700 space-y-2 mt-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={opt.id} className={`flex items-start gap-2 ${opt.is_correct ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {opt.is_correct ? (
                                                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">check_circle</span>
                                                ) : (
                                                    <span className="w-[18px] shrink-0 inline-block"></span>
                                                )}
                                                <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
