import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export default function JoinExam() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const joinFromLink = async () => {
            const token = localStorage.getItem('access');

            if (!token) {
                // If not logged in, redirect to login, then maybe back to this link.
                // For simplicity, just send them to login with a message.
                localStorage.setItem('redirectAfterLogin', `/exam/join/${code}`);
                navigate('/login');
                return;
            }

            try {
                const decoded = jwtDecode(token);
                if (decoded.role !== 'STUDENT') {
                    setError("Only students can join taking exams via links.");
                    setLoading(false);
                    return;
                }

                const res = await api.post('exams/join/', { unique_code: code.toUpperCase() });
                // Joined successfully, redirect to take exam page
                navigate(`/exams/${res.data.exam_id}/take`);
            } catch (err) {
                setError(err.response?.data?.detail || "Invalid or inactive exam join link.");
                setLoading(false);
            }
        };

        joinFromLink();
    }, [code, navigate]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex justify-center items-center bg-background-light">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                    <h5 className="text-lg font-semibold text-gray-800">Joining Exam...</h5>
                    <p className="text-gray-500 mt-2">Please wait while we verify your exam link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light py-12 px-4 flex justify-center items-start">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
                <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Join Failed</h4>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
