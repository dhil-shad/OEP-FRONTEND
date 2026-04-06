import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function ExamDashboard() {
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [activeTab, setActiveTab] = useState('exams'); // 'exams', 'students', 'notifications', 'profile'
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [notifyingStudent, setNotifyingStudent] = useState(null);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Handle tab from URL dynamically
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['exams', 'students', 'notifications', 'profile'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [location.search]);

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
            .then(res => {
                setProfile(res.data);
                if (res.data.associated_institution && res.data.role === 'INSTRUCTOR') {
                    fetchPendingRequests();
                    fetchSections(res.data.department);
                }
                fetchNotifications();
            })
            .catch(console.error);

        fetchExams();
        fetchStudents();
    }, []);

    const fetchSections = async (deptId) => {
        if (!deptId) return;
        try {
            const res = await api.get(`users/sections/?department_id=${deptId}`);
            setSections(res.data);
        } catch (err) {
            console.error('Failed to fetch sections', err);
        }
    };

    const fetchClasses = async (sectionId) => {
        if (!sectionId) {
            setClasses([]);
            return;
        }
        try {
            const res = await api.get(`users/classes/?section_id=${sectionId}`);
            setClasses(res.data);
        } catch (err) {
            console.error('Failed to fetch classes', err);
        }
    };

    useEffect(() => {
        if (selectedSection) {
            fetchClasses(selectedSection);
            setSelectedClass('');
        } else {
            setClasses([]);
            setSelectedClass('');
        }
    }, [selectedSection]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('users/notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await api.get('users/institution/requests/');
            setPendingRequests(res.data.filter(r => r.status === 'PENDING'));
        } catch (err) {
            console.error('Failed to fetch join requests', err);
        }
    };

    const handleRespondRequest = async (id, action) => {
        try {
            await api.post(`users/institution/requests/${id}/respond/`, { action });
            setPendingRequests(pendingRequests.filter(req => req.id !== id));
            if (action === 'approve') {
                fetchStudents();
                alert('Student joined successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to respond to request.');
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get('users/department/students/');
            setStudents(response.data);
        } catch (err) {
            console.error('Failed to fetch department students', err);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notifTitle || !notifMessage) return;

        setNotifLoading(true);
        try {
            await api.post('users/notifications/', {
                user: notifyingStudent.id,
                title: notifTitle,
                message: notifMessage
            });
            alert(`Notification sent to ${notifyingStudent.username}!`);
            setNotifyingStudent(null);
            setNotifTitle('');
            setNotifMessage('');
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to send notification.');
        } finally {
            setNotifLoading(false);
        }
    };

    const fetchExams = async () => {
        try {
            const response = await api.get('exams/');
            let data = response.data;
            data = Array.isArray(data) ? data : (data.results || []);

            // Custom sort: Live (1), Ended (2), Upcoming (3), Draft (4)
            const statusWeight = { 'Live': 1, 'Ended': 2, 'Upcoming': 3, 'Draft': 4 };
            data.sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));

            setExams(data);
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
                        <p className="text-slate-500 dark:text-slate-400">
                            {userRole === 'INSTRUCTOR' ? `Welcome, Instructor (${profile?.department_name || 'General'})` : 'Manage and access your examinations.'}
                        </p>
                        {userRole === 'INSTRUCTOR' && !profile?.associated_institution && (
                            <button
                                onClick={() => navigate('/instructor/join-institution')}
                                className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-[1.02]"
                            >
                                <span className="material-symbols-outlined text-sm">apartment</span>
                                Join an Institution
                            </button>
                        )}
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
                                <>
                                    <button
                                        onClick={() => setActiveTab('students')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Students
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all relative ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                    >
                                        Notifications
                                        {pendingRequests.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-800">
                                                {pendingRequests.length}
                                            </span>
                                        )}
                                    </button>
                                </>
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
                            </div>
                        </div>
                    </div>
                ) : userRole === 'INSTRUCTOR' && activeTab === 'students' ? (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Department Students</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Enrolled students in {profile?.department_name || 'your department'}</p>
                                </div>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Section:</label>
                                        <select
                                            value={selectedSection}
                                            onChange={(e) => setSelectedSection(e.target.value)}
                                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-1 ring-primary transition-all"
                                        >
                                            <option value="">All Sections</option>
                                            {sections.map(sec => (
                                                <option key={sec.id} value={sec.id}>{sec.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class:</label>
                                        <select
                                            value={selectedClass}
                                            onChange={(e) => setSelectedClass(e.target.value)}
                                            disabled={!selectedSection}
                                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-1 ring-primary transition-all disabled:opacity-50"
                                        >
                                            <option value="">All Classes</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-black tracking-wider uppercase">
                                        {students.filter(s =>
                                            (!selectedSection || s.section === parseInt(selectedSection)) &&
                                            (!selectedClass || s.study_class === parseInt(selectedClass))
                                        ).length} Students
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
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
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Section</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {students
                                                .filter(s =>
                                                    (!selectedSection || s.section === parseInt(selectedSection)) &&
                                                    (!selectedClass || s.study_class === parseInt(selectedClass))
                                                )
                                                .map(student => (
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-600 dark:text-slate-400">
                                                            {student.section_name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900/50 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">{student.study_class_name || 'N/A'}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                            {student.email}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <button
                                                                onClick={() => setNotifyingStudent(student)}
                                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                                title="Send Notification"
                                                            >
                                                                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : userRole === 'INSTRUCTOR' && activeTab === 'notifications' ? (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Join Requests</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Students requesting to join your department.</p>

                            {pendingRequests.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-12 text-center text-decoration-none">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined">how_to_reg</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No pending requests for your department.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {pendingRequests.map(req => (
                                            <li key={req.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                                        {req.student_name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{req.student_name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {req.section_name} • {req.study_class_name} • {req.enrollment_number}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRespondRequest(req.id, 'approve')}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-all shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">check</span> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespondRequest(req.id, 'reject')}
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span> Reject
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Notifications</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Recent system updates and messages.</p>

                            {notifications.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-12 text-center">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined">notifications</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map(notif => (
                                        <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.is_read ? 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-primary/20 shadow-sm shadow-primary/5'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Student Notifications View */}
                        {userRole === 'STUDENT' && activeTab === 'notifications' ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">notifications</span>
                                        My Notifications
                                    </h3>
                                    <button
                                        onClick={() => setActiveTab('exams')}
                                        className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                        Back to Exams
                                    </button>
                                </div>
                                <div className="p-6">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="material-symbols-outlined text-3xl">notifications</span>
                                            </div>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {notifications.map(notif => (
                                                <div key={notif.id} className={`p-4 rounded-2xl border transition-all ${notif.is_read ? 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-primary/20 shadow-sm shadow-primary/5'}`}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase whitespace-nowrap ${exam.status === 'Live' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            exam.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                exam.status === 'Ended' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                                    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                            }`}>
                                                            {exam.status}
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
                    </>
                )}
            </div>

            {/* Notification Modal */}
            {notifyingStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">campaign</span>
                                Notify {notifyingStudent.username}
                            </h3>
                            <button
                                onClick={() => setNotifyingStudent(null)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white"
                                    placeholder="e.g., Exam Scheduled, Missing Submission"
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white resize-none"
                                    placeholder="Write your message here..."
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNotifyingStudent(null)}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={notifLoading}
                                    className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {notifLoading ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[18px]">send</span>
                                            Send Alert
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
