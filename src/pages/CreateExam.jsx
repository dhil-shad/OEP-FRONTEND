import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateExam() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        pass_percentage: 50,
        is_active: false,
        is_randomized: true,
        proctoring: {
            webcam_enabled: false,
            screen_record_enabled: false,
            full_screen_enforced: true,
            tolerance_count: 3
        },
        section: '',
        study_class: ''
    });
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user profile to get department ID
        api.get('users/profile/')
            .then(res => {
                setUserProfile(res.data);
                if (res.data.department) {
                    fetchSections(res.data.department);
                }
            })
            .catch(err => {
                console.error("Failed to fetch profile", err);
                setError("Could not load user profile.");
            });
    }, []);

    const fetchSections = async (deptId) => {
        try {
            const res = await api.get(`users/sections/?department_id=${deptId}`);
            setSections(res.data);
        } catch (err) {
            console.error("Failed to fetch sections", err);
        }
    };

    const fetchClasses = async (sectionId) => {
        try {
            const res = await api.get(`users/classes/?section_id=${sectionId}`);
            setClasses(res.data);
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (e.target.name.startsWith('proctoring.')) {
            const field = e.target.name.split('.')[1];
            setFormData({
                ...formData,
                proctoring: { ...formData.proctoring, [field]: value }
            });
        } else {
            setFormData({ ...formData, [e.target.name]: value });
            if (e.target.name === 'section') {
                setClasses([]);
                setFormData(prev => ({ ...prev, section: value, study_class: '' }));
                if (value) fetchClasses(value);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('exams/', formData);
            navigate(`/exams/${res.data.id}`, { state: { openQuestionForm: true } });
        } catch (err) {
            setError(err.response?.data || 'Failed to create exam');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background-light dark:bg-background-dark py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create New Exam</h2>
                    <p className="text-slate-500 dark:text-slate-400">Set up a new examination with secure proctoring options.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 sm:p-10">
                        {error && (
                            <div className="mb-8 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-xl flex flex-col gap-1">
                                <div className="flex items-center gap-2 font-bold">
                                    <span className="material-symbols-outlined shrink-0 text-xl">error</span>
                                    <span>Error creating exam</span>
                                </div>
                                <pre className="text-xs whitespace-pre-wrap font-mono mt-2 overflow-x-auto">{JSON.stringify(error, null, 2)}</pre>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Exam Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="e.g., Midterm Computer Science 101"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 placeholder-slate-400 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Brief instructions or summary for the students..."
                                    />
                                </div>

                                {userProfile?.associated_institution && (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Section</label>
                                            <select
                                                name="section"
                                                value={formData.section}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            >
                                                <option value="">Select Section</option>
                                                {sections.map(sec => (
                                                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Class</label>
                                            <select
                                                name="study_class"
                                                value={formData.study_class}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                disabled={!formData.section}
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            name="start_time"
                                            required
                                            value={formData.start_time}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">End Time</label>
                                        <input
                                            type="datetime-local"
                                            name="end_time"
                                            required
                                            value={formData.end_time}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Duration (Minutes)</label>
                                        <input
                                            type="number"
                                            name="duration_minutes"
                                            required
                                            min="1"
                                            value={formData.duration_minutes}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pass Percentage</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="pass_percentage"
                                                required
                                                min="1"
                                                max="100"
                                                value={formData.pass_percentage}
                                                onChange={handleChange}
                                                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 pl-4 pr-10 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background-light dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                                <span className="text-slate-500 font-bold">%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Randomize Questions</span>
                                            <span className="text-xs text-slate-500">Shuffle question order for each student.</span>
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="is_randomized" className="sr-only peer" checked={formData.is_randomized} onChange={handleChange} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                                <div className="mb-6 flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined">security</span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure Proctoring Settings</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="flex items-start justify-between bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                        <span className="flex flex-col pr-4">
                                            <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Require Webcam Access</span>
                                            <span className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Capture periodic snapshots during the exam.</span>
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                            <input type="checkbox" name="proctoring.webcam_enabled" className="sr-only peer" checked={formData.proctoring.webcam_enabled} onChange={handleChange} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-start justify-between bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                        <span className="flex flex-col pr-4">
                                            <span className="text-sm font-bold text-rose-700 dark:text-rose-400">Require Screen Sharing</span>
                                            <span className="text-xs text-rose-600/70 dark:text-rose-400/70 mt-1">Record the candidate's screen during the exam.</span>
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                            <input type="checkbox" name="proctoring.screen_record_enabled" className="sr-only peer" checked={formData.proctoring.screen_record_enabled} onChange={handleChange} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-start justify-between bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                        <span className="flex flex-col pr-4">
                                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Enforce Full Screen</span>
                                            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">Prevent navigating away from the exam window.</span>
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                                            <input type="checkbox" name="proctoring.full_screen_enforced" className="sr-only peer" checked={formData.proctoring.full_screen_enforced} onChange={handleChange} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                                        </label>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Violation Tolerance Count</label>
                                        <input
                                            type="number"
                                            name="proctoring.tolerance_count"
                                            required
                                            min="1"
                                            value={formData.proctoring.tolerance_count}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">Auto-submits exam on {formData.proctoring.tolerance_count} violations.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                                >
                                    Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
