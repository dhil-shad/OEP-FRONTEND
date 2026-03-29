import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function SectionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [section, setSection] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sectionRes, classesRes] = await Promise.all([
                api.get(`users/sections/${id}/`),
                api.get(`users/classes/?section_id=${id}`)
            ]);
            setSection(sectionRes.data);
            setClasses(classesRes.data);
        } catch (err) {
            console.error("Failed to fetch section details", err);
            setSection(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('users/classes/', {
                section: id,
                name: newClassName
            });
            setNewClassName('');
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            console.error("Failed to add class", err);
            alert(err.response?.data?.detail || "Failed to add class");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-500 font-bold animate-pulse">Loading Section Details...</p>
        </div>
    );

    if (!section) return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-900 p-8 text-center">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-rose-500">error</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Section Not Found</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium">
                We couldn't retrieve the details for this section. It might have been deleted or you may not have permission.
            </p>
            <button
                onClick={() => navigate(-1)}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
                <span className="material-symbols-outlined">arrow_back</span>
                Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 font-bold text-sm"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Department
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-primary">layers</span>
                            {section.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            Manage classes within this section.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Add Class
                    </button>
                </div>

                {/* Content */}
                {classes.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300">school</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Classes Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Start by adding your first class to this section.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classes.map(cls => (
                            <div
                                key={cls.id}
                                className="group bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">school</span>
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">ID: #{cls.id}</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors">{cls.name}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                    Added {new Date(cls.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Class Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Add New Class</h2>
                        <form onSubmit={handleAddClass} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Class Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    placeholder="e.g. FY B.Sc IT"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center"
                                >
                                    {processing ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
