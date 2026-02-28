import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function ExamDashboard() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (err) {
                console.error("Invalid token", err);
            }
        }
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get('exams/');
            const data = response.data;
            setExams(Array.isArray(data) ? data : (data.results || []));
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch exams.');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading exams...</p>
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
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Exams Dashboard</h2>
                        <p className="text-slate-500 dark:text-slate-400">Manage and access your examinations.</p>
                    </div>
                    {userRole === 'INSTRUCTOR' && (
                        <button
                            onClick={() => navigate('/exams/create')}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create New Exam
                        </button>
                    )}
                </div>

                {userRole === 'STUDENT' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">key</span>
                                    Have an Exam Code?
                                </h5>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Enter the code provided by your instructor to join the secure exam environment.</p>
                            </div>
                            <div className="flex w-full md:w-auto gap-3">
                                <input
                                    type="text"
                                    className="w-full md:w-64 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white uppercase font-mono tracking-widest"
                                    placeholder="8-DIGIT CODE"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    maxLength={8}
                                />
                                <button
                                    className="flex items-center justify-center whitespace-nowrap bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={joinLoading || !joinCode}
                                    onClick={async () => {
                                        setJoinLoading(true);
                                        try {
                                            const res = await api.post('exams/join/', { unique_code: joinCode });
                                            navigate(`/exams/${res.data.exam_id}/take`);
                                        } catch (err) {
                                            alert(err.response?.data?.detail || 'Failed to join exam. Please check the code.');
                                        } finally {
                                            setJoinLoading(false);
                                        }
                                    }}
                                >
                                    {joinLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        'Join Exam'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {exams.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">inbox</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Exams Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {userRole === 'STUDENT' ? "You haven't joined any active exams yet." : "You haven't created any exams yet."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map((exam) => (
                            <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col h-full group">
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{exam.title}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase whitespace-nowrap ${exam.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {exam.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3">
                                        {exam.description || 'No description provided.'}
                                    </p>

                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            {exam.instructor_name}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {exam.duration_minutes} mins
                                        </div>
                                    </div>

                                    {userRole === 'INSTRUCTOR' ? (
                                        <button
                                            className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                                            onClick={() => navigate(`/exams/${exam.id}`)}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            Manage Exam
                                        </button>
                                    ) : (
                                        <button
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-primary dark:bg-white dark:text-slate-900 dark:hover:bg-primary text-white hover:text-white py-2.5 rounded-xl text-sm font-bold transition-colors"
                                            onClick={() => navigate(`/exams/${exam.id}/take`)}
                                        >
                                            Continue Exam
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
