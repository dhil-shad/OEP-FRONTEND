import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function ExamDashboard() {
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [activeTab, setActiveTab] = useState('exams'); // 'exams' or 'students'
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

        api.get('users/profile/')
            .then(res => setProfile(res.data))
            .catch(console.error);

        fetchExams();
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('users/department/students/');
            setStudents(response.data);
        } catch (err) {
            console.error('Failed to fetch department students', err);
        }
    };

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
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {userRole === 'INSTRUCTOR' && profile?.associated_institution_name ? `${profile.associated_institution_name}` : 'Exams Dashboard'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {userRole === 'INSTRUCTOR' ? `Welcome, Instructor (${profile?.department_name || 'General'})` : 'Manage and access your examinations.'}
                        </p>
                    </div>
                    {userRole === 'INSTRUCTOR' && (
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('exams')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'exams' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Exams
                            </button>
                            {profile?.associated_institution && (
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    Students
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Profile
                            </button>
                        </div>
                    )}
                    {userRole === 'INSTRUCTOR' && activeTab === 'exams' && (
                        <button
                            onClick={() => navigate('/exams/create')}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create New Exam
                        </button>
                    )}
                </div>

                {userRole === 'INSTRUCTOR' && activeTab === 'profile' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative">
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-4xl">person</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-14 px-8 pb-8">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{profile?.username}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Role: Instructor</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-0.5">apartment</span>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institution</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.associated_institution_name || 'Independent'}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-0.5">school</span>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.department_name || 'General'}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-0.5">mail</span>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.email}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary mt-0.5">badge</span>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID (UID)</div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{profile?.uid}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-4">
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                        Edit Full Profile
                                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : userRole === 'INSTRUCTOR' && activeTab === 'students' ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Department Students</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled students in {profile?.department_name || 'your department'}</p>
                            </div>
                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                                {students.length} Students
                            </div>
                        </div>
                        {students.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">groups</span>
                                <p className="text-slate-500 dark:text-slate-400">No students found in your department yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider px-6 text-right">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {students.map(student => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                                                            {student.username[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{student.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        {student.enrollment_number || 'N/A'}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    {student.email}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
}
