import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function DepartmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [department, setDepartment] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [deptRes, sectionsRes] = await Promise.all([
                api.get(`users/departments/${id}/`),
                api.get(`users/sections/?department_id=${id}`)
            ]);
            setDepartment(deptRes.data);
            setSections(sectionsRes.data);
        } catch (err) {
            console.error('Error fetching department details:', err);
            setError('Failed to load department details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionName.trim()) return;

        try {
            await api.post('users/sections/', {
                department: id,
                name: newSectionName
            });
            setNewSectionName('');
            setShowAddModal(false);
            fetchData();
        } catch (err) {
            console.error('Error adding section:', err);
            setError(err.response?.data?.detail || 'Failed to add section.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
    );

    if (error && !department) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Oops!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/institution')}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/institution')}
                            className="flex items-center gap-2 text-primary font-bold mb-2 hover:translate-x-[-4px] transition-transform"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Back to Departments
                        </button>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                            {department?.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {department?.description || 'No description provided.'}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Add Section
                    </button>
                </div>

                {/* Sections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sections.length === 0 ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-slate-400 text-4xl">layers</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Sections Yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
                                Break down your department into manageable groups by adding sections.
                            </p>
                        </div>
                    ) : (
                        sections.map(section => (
                            <div
                                key={section.id}
                                onClick={() => navigate(`/institution/sections/${section.id}`)}
                                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                                        <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">grid_view</span>
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-full">
                                        ID: #{section.id}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                    {section.name}
                                </h3>
                                <div className="flex items-center gap-3 text-slate-400 text-sm mt-2 font-bold bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                                    <span className="material-symbols-outlined text-xs text-primary">school</span>
                                    <span>{section.classes_count || 0} Classes</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                    <span className="material-symbols-outlined text-xs">calendar_month</span>
                                    <span>Added {new Date(section.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Section Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowAddModal(false)}
                        ></div>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add New Section</h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleAddSection} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                                            Section Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newSectionName}
                                            onChange={(e) => setNewSectionName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 outline-none focus:ring-4 ring-primary/10 transition-all text-slate-900 dark:text-white font-bold placeholder:text-slate-400"
                                            placeholder="e.g., Section A, Batch 2024"
                                            autoFocus
                                        />
                                    </div>

                                    {error && <p className="text-rose-500 text-sm font-bold bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-2px] transition-all"
                                    >
                                        Create Section
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
