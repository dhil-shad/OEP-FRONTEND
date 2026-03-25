import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const TABS = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'requests', label: 'Join Requests', icon: 'how_to_reg' },
    { key: 'instructors', label: 'Instructors', icon: 'school' },
    { key: 'profile', label: 'Profile', icon: 'account_circle' },
    { key: 'invite', label: 'Send Invite', icon: 'mail' },
];

export default function InstitutionDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [profile, setProfile] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState(null);
    const navigate = useNavigate();

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
            .then(res => { setRequests(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [navigate]);

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
                {/* ─── HOME TAB ─── */}
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
                                { label: 'Total Students', value: '—', icon: 'groups', color: 'bg-green-500' },
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
                                                {stat.label === 'Total Students' ? requests.filter(r => r.status === 'APPROVED').length : stat.value}
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

                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl">school</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Instructors Yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    Send invites to add instructors to your institution.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── JOIN REQUESTS TAB ─── */}
                {activeTab === 'requests' && (
                    <div>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Student Join Requests</h2>
                            <p className="text-slate-500 dark:text-slate-400">Review and approve accounts wanting to link to your institution.</p>
                        </div>

                        {requests.length === 0 ? (
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
                                    {requests.map(req => (
                                        <li key={req.id} className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined">person</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-lg">{req.student_name}</div>
                                                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Enrollment: <span className="text-slate-700 dark:text-slate-300">{req.enrollment_number}</span></div>
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
            </div>
        </div>
    );
}
