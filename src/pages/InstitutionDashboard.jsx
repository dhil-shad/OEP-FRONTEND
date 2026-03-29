import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const TABS = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'departments', label: 'Departments', icon: 'domain' },
    { key: 'add_department', label: 'Add Department', icon: 'add_business' },
    { key: 'students', label: 'Students', icon: 'groups' },
    { key: 'requests', label: 'Join Requests', icon: 'how_to_reg' },
    { key: 'instructors', label: 'Instructors', icon: 'school' },
    { key: 'profile', label: 'Profile', icon: 'account_circle' },
    { key: 'invite', label: 'Send Invite', icon: 'mail' },
];

export default function InstitutionDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [profile, setProfile] = useState(null);
    const [requests, setRequests] = useState([]);
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [showPromotionModal, setShowPromotionModal] = useState(null); // Stores student object
    const [selectedDept, setSelectedDept] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState(null);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [deptStatus, setDeptStatus] = useState(null);
    const [requestFilter, setRequestFilter] = useState('STUDENT'); // 'STUDENT' or 'INSTRUCTOR'
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = () => setOpenMenu(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) { navigate('/login'); return; }
        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== 'INSTITUTION') { navigate('/dashboard'); return; }
        } catch { navigate('/login'); return; }

        api.get('users/profile/')
            .then(res => { setProfile(res.data); })
            .catch(console.error);

        api.get('users/institution/requests/')
            .then(res => { setRequests(res.data); })
            .catch(console.error)
            .finally(() => setLoading(false));

        fetchDepartments();
        fetchStudents();
        fetchInstructors();
    }, [navigate]);

    const fetchStudents = async () => {
        try {
            const res = await api.get('users/institution/students/');
            setStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        }
    };

    const fetchInstructors = async () => {
        try {
            const res = await api.get('users/institution/instructors/');
            setInstructors(res.data);
        } catch (err) {
            console.error('Failed to fetch instructors', err);
        }
    };

    const handleStudentAction = async (id, action) => {
        if (action === 'promote') {
            const student = students.find(s => s.id === id);
            setShowPromotionModal(student);
            return;
        }

        if (!window.confirm(`Are you sure you want to ${action} this student?`)) return;
        try {
            await api.post(`users/institution/students/${id}/action/`, { action });
            refreshData();
            alert('Student removed from institution.');
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to perform action.');
        }
    };

    const confirmPromotion = async () => {
        if (!selectedDept) {
            alert('Please select a department.');
            return;
        }
        try {
            await api.post(`users/institution/students/${showPromotionModal.id}/action/`, {
                action: 'promote',
                department_id: selectedDept
            });
            setShowPromotionModal(null);
            setSelectedDept('');
            refreshData();
            alert('Student promoted to instructor successfully!');
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to promote student.');
        }
    };

    const refreshData = () => {
        fetchStudents();
        fetchInstructors();
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('users/departments/');
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    const handleRespondRequest = async (id, action) => {
        try {
            await api.post(`users/institution/requests/${id}/respond/`, { action });
            setRequests(requests.map(req => req.id === id ? { ...req, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : req));
        } catch (err) {
            alert(err.response?.data?.detail || 'Failed to respond to request.');
        }
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        setInviteStatus(null);
        try {
            await api.post('users/invite/', { email: inviteEmail });
            setInviteStatus({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
            setInviteEmail('');
        } catch (err) {
            setInviteStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to send invitation.' });
        }
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setDeptStatus(null);
        try {
            const res = await api.post('users/departments/', newDept);
            setDepartments([...departments, res.data]);
            setDeptStatus({ type: 'success', message: `Department "${newDept.name}" created successfully!` });
            setNewDept({ name: '', description: '' });
            setTimeout(() => setActiveTab('departments'), 1500);
        } catch (err) {
            setDeptStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to create department.' });
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`users/departments/${id}/`);
            setDepartments(departments.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to delete department.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading dashboard...</p>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-1 overflow-x-auto py-2" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* ─── DEPARTMENTS TAB ─── */}
                {activeTab === 'departments' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Departments</h2>
                                <p className="text-slate-500 dark:text-slate-400">View and manage your institution's academic departments.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('add_department')}
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Department
                            </button>
                        </div>

                        {departments.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-center py-16">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">domain</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Departments Yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Start by adding departments to organize your instructors and students.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {departments.map(dept => (
                                    <div
                                        key={dept.id}
                                        onClick={() => navigate(`/institution/departments/${dept.id}`)}
                                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all group relative"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDepartment(dept.id);
                                            }}
                                            className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                                <span className="material-symbols-outlined">domain</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sections</span>
                                                <span className="text-lg font-black text-primary">{dept.sections_count || 0}</span>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dept.name}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                                            {dept.description || 'No description provided.'}
                                        </p>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Created: {new Date(dept.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── ADD DEPARTMENT TAB ─── */}
                {activeTab === 'add_department' && (
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Add New Department</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Create a new academic department for your institution.</p>

                        <div className="max-w-xl">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                                {deptStatus && (
                                    <div className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium ${deptStatus.type === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                                        : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                                        }`}>
                                        <span className="material-symbols-outlined shrink-0 text-xl">
                                            {deptStatus.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        {deptStatus.message}
                                    </div>
                                )}

                                <form onSubmit={handleCreateDepartment} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Department Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newDept.name}
                                            onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                            className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                            placeholder="e.g., Computer Science & Engineering"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={newDept.description}
                                            onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                                            rows="4"
                                            className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                            placeholder="Briefly describe the department..."
                                        ></textarea>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('departments')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 rounded-xl font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                                        >
                                            <span className="material-symbols-outlined text-lg">add</span>
                                            Create Department
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'home' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                Welcome, {profile?.institution_name || profile?.username}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">Manage your institution from this central hub.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Instructors', value: '—', icon: 'school', color: 'bg-blue-500' },
                                { label: 'Total Instructors', value: instructors.length, icon: 'school', color: 'bg-blue-500' },
                                { label: 'Total Students', value: students.length, icon: 'groups', color: 'bg-green-500' },
                                { label: 'Active Exams', value: '—', icon: 'description', color: 'bg-amber-500' },
                                { label: 'Invites Sent', value: '—', icon: 'send', color: 'bg-purple-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-${stat.color.split('-')[1]}-500/20`}>
                                            <span className="material-symbols-outlined">{stat.icon}</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                                {stat.value}
                                            </div>
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── INSTRUCTORS TAB ─── */}
                {activeTab === 'instructors' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Instructors</h2>
                                <p className="text-slate-500 dark:text-slate-400">View and manage your institution's instructors.</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('invite')}
                                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
                            >
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Invite Instructor
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            {instructors.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl">school</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Instructors Yet</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                        Send invites or promote students to add instructors to your institution.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Instructor Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {instructors.map(instructor => (
                                                <tr key={instructor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                                {instructor.username[0].toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">{instructor.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                            <span className="material-symbols-outlined text-[14px]">domain</span>
                                                            {instructor.department || 'General'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {instructor.email}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── STUDENTS TAB ─── */}
                {activeTab === 'students' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Enrolled Students</h2>
                            <p className="text-slate-500 dark:text-slate-400">View and manage students currently linked to your institution.</p>
                        </div>

                        {students.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-center py-16">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">groups</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Students Enrolled</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                    Once you approve student join requests, they will appear here in your directory.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Enrollment ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dept / Section / Class</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {students.map(student => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                                                {student.username[0].toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">{student.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono text-slate-600 dark:text-slate-400">
                                                            {student.enrollment_number || 'N/A'}
                                                        </code>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                                <span className="material-symbols-outlined text-[14px]">domain</span>
                                                                {student.department_name || student.department || 'General'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400">
                                                                <span className="material-symbols-outlined text-[14px]">layers</span>
                                                                {student.section_name || student.section || 'N/A'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                                <span className="material-symbols-outlined text-[14px]">class</span>
                                                                {student.study_class_name || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                        {student.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenu(openMenu === student.id ? null : student.id);
                                                            }}
                                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                                        >
                                                            <span className="material-symbols-outlined">more_vert</span>
                                                        </button>

                                                        {openMenu === student.id && (
                                                            <div className="absolute right-6 top-10 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                                <button
                                                                    onClick={() => handleStudentAction(student.id, 'promote')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-blue-500 text-lg">school</span>
                                                                    Promote to Instructor
                                                                </button>
                                                                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                                                                <button
                                                                    onClick={() => handleStudentAction(student.id, 'kick')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-left transition-colors"
                                                                >
                                                                    <span className="material-symbols-outlined text-lg">person_remove</span>
                                                                    Kick from Institution
                                                                </button>
                                                            </div>
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
                )}

                {/* ─── JOIN REQUESTS TAB ─── */}
                {activeTab === 'requests' && (
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Join Requests</h2>
                                <p className="text-slate-500 dark:text-slate-400">Review and approve accounts wanting to link to your institution.</p>
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setRequestFilter('STUDENT')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${requestFilter === 'STUDENT' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">groups</span>
                                    Students
                                </button>
                                <button
                                    onClick={() => setRequestFilter('INSTRUCTOR')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${requestFilter === 'INSTRUCTOR' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">school</span>
                                    Instructors
                                </button>
                            </div>
                        </div>

                        {requests.filter(r => r.student_role === requestFilter).length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-center py-16">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">inbox</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Requests Found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                                    When students request to join using your Institution Code, they will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {requests.filter(r => r.student_role === requestFilter).map(req => (
                                        <li key={req.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">{req.student_role === 'STUDENT' ? 'person' : 'school'}</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-lg">{req.student_name}</div>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">{req.department_name}</span>
                                                        {req.student_role === 'STUDENT' && (
                                                            <>
                                                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 rounded-full">{req.section_name}</span>
                                                                <span className="text-xs font-bold px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">{req.study_class_name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {req.student_role === 'STUDENT' && (
                                                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Enrollment: <span className="text-slate-700 dark:text-slate-300">{req.enrollment_number}</span></div>
                                                    )}
                                                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        Requested: {new Date(req.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {req.status === 'PENDING' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRespondRequest(req.id, 'approve')}
                                                            className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">check</span> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRespondRequest(req.id, 'reject')}
                                                            className="flex items-center gap-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">close</span> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                                        {req.status}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── PROFILE TAB ─── */}
                {activeTab === 'profile' && (
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Institution Profile</h2>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Header Banner */}
                            <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative">
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-4xl">apartment</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-14 px-8 pb-8">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                    {profile?.institution_name || 'Institution Name'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">@{profile?.username}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Institution UID', value: profile?.uid, icon: 'badge' },
                                        { label: 'Email', value: profile?.email, icon: 'mail' },
                                        { label: 'Phone', value: profile?.institution_phone || 'Not provided', icon: 'phone' },
                                        { label: 'Address', value: profile?.institution_address || 'Not provided', icon: 'location_on' },
                                        { label: 'Website', value: profile?.institution_website || 'Not provided', icon: 'language' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                            <span className="material-symbols-outlined text-primary mt-0.5">{item.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 break-all">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── SEND INVITE TAB ─── */}
                {activeTab === 'invite' && (
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Send Invite</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Invite instructors to join your institution on OEP.</p>

                        <div className="max-w-lg">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
                                {inviteStatus && (
                                    <div className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium ${inviteStatus.type === 'success'
                                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                                        : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                                        }`}>
                                        <span className="material-symbols-outlined shrink-0 text-xl">
                                            {inviteStatus.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        {inviteStatus.message}
                                    </div>
                                )}

                                <form onSubmit={handleSendInvite} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Instructor Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="block w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors"
                                            placeholder="instructor@example.com"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
                                    >
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        Send Invitation
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {/* Promotion Modal */}
                {showPromotionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPromotionModal(null)}></div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-500">school</span>
                                    Promote to Instructor
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Promoting <span className="font-bold text-slate-700 dark:text-slate-200">{showPromotionModal.username}</span>.
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Assign Department</label>
                                    <select
                                        value={selectedDept}
                                        onChange={(e) => setSelectedDept(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 transition-all text-slate-700 dark:text-slate-200 font-medium"
                                    >
                                        <option value="">Select a department...</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex gap-3">
                                <button
                                    onClick={() => setShowPromotionModal(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPromotion}
                                    className="flex-1 bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                                >
                                    Confirm Promotion
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
