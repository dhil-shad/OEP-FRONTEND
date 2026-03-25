import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('access');
    const isAuthenticated = !!token;
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role);
            } catch (err) {
                console.error("Invalid token", err);
            }
        } else {
            setUserRole(null);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-decoration-none">
                        <div className="bg-primary p-1.5 rounded-lg text-white flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl leading-none">shield_lock</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">OEP</span>
                    </Link>

                    <nav className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                {userRole === 'INSTITUTION' ? (
                                    <Link to="/institution" className="text-sm font-medium hover:text-primary transition-colors text-slate-700 dark:text-slate-300">Institution</Link>
                                ) : (
                                    <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-slate-700 dark:text-slate-300">Dashboard</Link>
                                )}
                                {userRole === 'INSTRUCTOR' && (
                                    <Link to="/grading" className="text-sm font-medium hover:text-primary transition-colors text-green-600 dark:text-green-400">Grade Exams</Link>
                                )}
                                {userRole === 'STUDENT' && (
                                    <div className="flex items-center gap-4">
                                        <Link to="/my-results" className="text-sm font-medium hover:text-primary transition-colors text-blue-600 dark:text-blue-400">My Results</Link>
                                        <Link to="/join-institution" className="text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                                            <span className="material-symbols-outlined text-[16px] text-primary">apartment</span>
                                            Join Institution
                                        </Link>
                                    </div>
                                )}
                                <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-primary transition-colors text-slate-700 dark:text-slate-300">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Register</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
