import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function GradeSubmission() {
    const { examId, subId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [grades, setGrades] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubmissionDetails();
    }, [examId, subId]);

    const fetchSubmissionDetails = async () => {
        try {
            const res = await api.get(`exams/${examId}/submissions/${subId}/`);
            setSubmission(res.data);

            // Pre-fill existing grades if any
            const existingGrades = {};
            res.data.answers.forEach(ans => {
                existingGrades[ans.id] = ans.marks_obtained;
            });
            setGrades(existingGrades);

            setLoading(false);
        } catch (err) {
            setError("Failed to fetch submission details");
            setLoading(false);
        }
    };

    const handleGradeChange = (answerId, marks) => {
        // If empty string, let it be empty so the validation catches it, otherwise parse float
        setGrades({ ...grades, [answerId]: marks === '' ? '' : parseFloat(marks) });
    };

    const submitGrades = async () => {
        // Validation: Ensure all answers have a grade assigned
        const ungradedCount = submission.answers.filter(ans => grades[ans.id] === undefined || grades[ans.id] === '').length;
        if (ungradedCount > 0) {
            alert(`Please assign marks to all answers. There are ${ungradedCount} answers left ungraded.`);
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`exams/${examId}/submissions/${subId}/grade/`, { grades });
            alert("Grades saved successfully!");
            navigate('/grading');
        } catch (err) {
            console.error("Failed to submit grades", err);
            alert("An error occurred while saving grades.");
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !submission) return (
        <div className="py-12 px-4 max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error || "Submission not found"}
            </div>
            <button
                onClick={() => navigate('/grading')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                Back to Grading
            </button>
        </div>
    );

    const totalCalculated = Object.values(grades).reduce((sum, val) => sum + (val || 0), 0);
    const isGraded = submission.status === 'GRADED';

    return (
        <div className="py-8 px-4 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2">Grading: {submission.student_name}</h2>
                    <p className="text-gray-500">Submitted: {new Date(submission.end_time || submission.start_time).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${isGraded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {submission.status}
                    </span>
                    <h4 className="text-2xl font-bold text-primary m-0">
                        Total Score: {totalCalculated.toFixed(1)}
                    </h4>
                </div>
            </div>

            {/* Tracking & Proctoring Logs Section */}
            {submission.logs && submission.logs.length > 0 && (
                <div className="mb-8 bg-white rounded-xl shadow-sm border-l-4 border-yellow-500 overflow-hidden">
                    <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 font-semibold text-yellow-800 flex items-center">
                        <span className="material-symbols-outlined mr-2">warning</span>
                        Activity Log (Potential Suspicious Behavior)
                    </div>
                    <div className="p-6">
                        <ul className="text-gray-600 max-h-40 overflow-y-auto space-y-2">
                            {submission.logs.map((log) => (
                                <li key={log.id} className="text-sm">
                                    <strong className="text-gray-900">{new Date(log.timestamp).toLocaleTimeString()}</strong>: {log.action}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Answers Section */}
            {submission.answers.length === 0 ? (
                <div className="bg-blue-50 text-blue-800 border-l-4 border-blue-500 p-4 rounded-md">
                    This submission contains no answers.
                </div>
            ) : (
                <div className="space-y-6">
                    {submission.answers.map((ans, idx) => (
                        <div key={ans.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h5 className="font-bold text-gray-700">Question:</h5>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">
                                        Max: {ans.question_marks || '-'} Marks
                                    </span>
                                </div>
                                <h5 className="text-lg font-medium text-gray-900 mb-6 whitespace-pre-wrap">{ans.question_text || `Question ID: ${ans.question}`}</h5>

                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h6 className="font-bold text-gray-500 mb-3 text-sm uppercase tracking-wider">Student's Answer:</h6>
                                    {ans.selected_option ? (
                                        <p className="m-0 font-medium text-gray-900">{ans.selected_option_text || `Option ID: ${ans.selected_option}`}</p>
                                    ) : ans.code_submission ? (
                                        <pre className="m-0 p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-sm font-mono">{ans.code_submission}</pre>
                                    ) : (
                                        <p className="m-0 text-left text-gray-800 whitespace-pre-wrap">{ans.descriptive_text || <span className="text-gray-400 italic">No answer provided</span>}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-6 bg-white pt-4 border-t border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <label className="font-bold text-gray-700">Marks Awarded:</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={grades[ans.id] || 0}
                                            onChange={(e) => handleGradeChange(ans.id, e.target.value)}
                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                        />
                                    </div>
                                    <div>
                                        {ans.is_graded && (
                                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                                <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                                Graded
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
                <button
                    onClick={() => navigate('/grading')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={submitGrades}
                    disabled={submitting}
                    className="px-8 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                >
                    {submitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        'Save & Finalize Grades'
                    )}
                </button>
            </div>
        </div>
    );
}
