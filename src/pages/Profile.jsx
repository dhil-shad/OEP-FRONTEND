import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('users/profile/')
            .then(res => {
                setProfile(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch profile", err);
                setError("Could not load profile information.");
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading profile...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
            <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/20 max-w-md text-center">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p className="font-semibold">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {/* Header/Banner Segment */}
                    <div className="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Basic Info */}
                        <div className="relative flex items-end -mt-16 mb-6">
                            <div className="h-32 w-32 rounded-3xl bg-white dark:bg-slate-700 p-1 shadow-xl border border-slate-100 dark:border-slate-600 overflow-hidden">
                                <div className="h-full w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-6xl">person</span>
                                </div>
                            </div>
                            <div className="ml-6 mb-2">
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{profile.username}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                                        {profile.role}
                                    </span>
                                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">UID: {profile.uid}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <DetailCard
                                icon="mail"
                                label="Email Address"
                                value={profile.email || "Not provided"}
                            />

                            {(profile.role === 'STUDENT' || profile.role === 'INSTRUCTOR') && (
                                <>
                                    <DetailCard
                                        icon="apartment"
                                        label="Institution"
                                        value={profile.associated_institution_name || `Independent ${profile.role === 'STUDENT' ? 'Student' : 'Instructor'}`}
                                    />
                                    {profile.role === 'STUDENT' && (
                                        <DetailCard
                                            icon="badge"
                                            label="Enrollment / Adm No"
                                            value={profile.enrollment_number || "Pending Approval"}
                                        />
                                    )}
                                    <DetailCard
                                        icon="school"
                                        label="Department"
                                        value={profile.department_name || profile.department || "General"}
                                    />
                                    <DetailCard
                                        icon="layers"
                                        label="Section"
                                        value={profile.section_name || profile.section || "N/A"}
                                    />
                                    <DetailCard
                                        icon="class"
                                        label="Class"
                                        value={profile.study_class_name || "N/A"}
                                    />
                                </>
                            )}

                            {profile.role === 'INSTITUTION' && (
                                <>
                                    <DetailCard
                                        icon="domain"
                                        label="Institution Name"
                                        value={profile.institution_name}
                                    />
                                    <DetailCard
                                        icon="location_on"
                                        label="Address"
                                        value={profile.institution_address}
                                    />
                                    <DetailCard
                                        icon="public"
                                        label="Website"
                                        value={profile.institution_website}
                                    />
                                </>
                            )}
                        </div>

                        {/* Footer Info */}
                        {!(profile.role === 'STUDENT' && profile.associated_institution) && (
                            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-4">
                                <button className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Profile
                                </button>
                                <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">lock</span>
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailCard({ icon, label, value }) {
    return (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-primary/20 dark:hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{icon}</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-semibold break-words">{value || "---"}</p>
        </div>
    );
}
