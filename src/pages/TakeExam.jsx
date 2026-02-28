import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export default function TakeExam() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [examData, setExamData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // Stores selected answers locally
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(null);
    const [durationText, setDurationText] = useState('');
    const [progress, setProgress] = useState(100);
    const timerRef = useRef(null);

    // Proctoring State
    const [proctoringSettings, setProctoringSettings] = useState(null);
    const [proctoringSetupDone, setProctoringSetupDone] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.role !== 'STUDENT') {
                    navigate('/dashboard');
                    return;
                }
            } catch (err) {
                console.error("Invalid token", err);
            }
        } else {
            navigate('/login');
            return;
        }

        fetchExamMetadata();
        return () => {
            clearInterval(timerRef.current);
            stopMediaStreams();
        };
    }, [id]);

    const stopMediaStreams = () => {
        if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
        if (screenStream) screenStream.getTracks().forEach(track => track.stop());
    };

    const fetchExamMetadata = async () => {
        try {
            const res = await api.get(`exams/${id}/`);
            if (res.data.proctoring) {
                setProctoringSettings(res.data.proctoring);
                if (!res.data.proctoring.webcam_enabled && !res.data.proctoring.screen_record_enabled && !res.data.proctoring.full_screen_enforced) {
                    setProctoringSetupDone(true);
                    startExam();
                } else {
                    setLoading(false); // Stop loading to show setup screen
                }
            } else {
                setProctoringSetupDone(true);
                startExam();
            }
        } catch (err) {
            setError('Failed to fetch exam settings.');
            setLoading(false);
        }
    };

    const setupProctoring = async () => {
        setLoading(true);
        try {
            if (proctoringSettings.full_screen_enforced) {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                }
            }

            if (proctoringSettings.webcam_enabled) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setMediaStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }

            if (proctoringSettings.screen_record_enabled) {
                const sStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                setScreenStream(sStream);
                // Listen for user stopping screen share manually
                sStream.getVideoTracks()[0].onended = () => {
                    logActivity('Screen Share Stopped', { time: new Date().toISOString() });
                    alert("Screen sharing was stopped! This is a violation.");
                };
            }

            setProctoringSetupDone(true);
            startExam();
        } catch (err) {
            console.error(err);
            setError("Failed to setup proctoring. You must grant required permissions to continue.");
            setLoading(false);
        }
    };

    // Proctoring & Tracking Event Listeners
    useEffect(() => {
        if (!examData) return; // Only track start if exam has loaded

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logActivity('Tab Switched / Minimized', { time: new Date().toISOString() }, 'TAB_SWITCH');
            } else if (document.visibilityState === 'visible') {
                logActivity('Returned to Exam Tab', { time: new Date().toISOString() });
            }
        };

        const handleBlur = () => {
            logActivity('Window Lost Focus', { time: new Date().toISOString() }, 'FOCUS_LOST');
        };

        const handleCopy = () => {
            logActivity('Attempted Copy', { time: new Date().toISOString() }, 'COPY_PASTE');
        };

        const handlePaste = () => {
            logActivity('Attempted Paste', { time: new Date().toISOString() }, 'COPY_PASTE');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && proctoringSettings?.full_screen_enforced) {
                logActivity('Exited Full Screen', { time: new Date().toISOString() }, 'FULL_SCREEN_EXIT');
                alert("Please return to Full Screen mode immediately!");
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [examData, proctoringSettings]);

    const logActivity = async (action, details = {}, violationType = 'NONE') => {
        try {
            const res = await api.post(`exams/${id}/log_activity/`, {
                action: action,
                violation_type: violationType,
                details: details
            });
            if (res.data.auto_submitted) {
                alert("You have exceeded the maximum allowed violations. Your exam has been auto-submitted.");
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Failed to log activity', err);
        }
    };

    const startExam = async () => {
        try {
            const res = await api.post(`exams/${id}/start/`);
            const { submission, questions } = res.data;

            // Map previous answers if any
            const existingAnswers = {};
            submission.answers.forEach(ans => {
                if (ans.selected_option) existingAnswers[ans.question] = ans.selected_option;
                else if (ans.descriptive_text) existingAnswers[ans.question] = ans.descriptive_text;
                else if (ans.code_submission) existingAnswers[ans.question] = ans.code_submission;
            });

            setExamData(submission);
            setQuestions(questions);
            setAnswers(existingAnswers);

            // Calculate absolute end time strictly from backend start_time or fallback
            let durationMs = 60 * 60000; // default 1h
            try {
                const detailsRes = await api.get(`exams/${id}/`);
                durationMs = detailsRes.data.duration_minutes * 60000;
            } catch (e) { }

            const absoluteEndTime = new Date(submission.start_time).getTime() + durationMs;

            startCountdown(absoluteEndTime, durationMs);
            setLoading(false);

        } catch (err) {
            // Handle Re-entry loop loophole: If they are trying to start a completed exam
            if (err.response && err.response.status === 400 && err.response.data.detail === "You have already submitted this exam.") {
                setError("You have already completed this exam.");
            } else {
                setError('Failed to start exam. You might not be a student or the exam is inactive.');
            }
            setLoading(false);
        }
    };

    const startCountdown = (absoluteEndTime, totalDurationMs) => {
        // Clear immediately if time is already up
        const initialNow = new Date().getTime();
        if (absoluteEndTime - initialNow <= 0) {
            setTimeLeft(0);
            autoSubmitExam();
            return;
        }

        timerRef.current = setInterval(() => {
            const now = new Date().getTime();
            const distance = absoluteEndTime - now;

            if (distance <= 0) {
                clearInterval(timerRef.current);
                setTimeLeft(0);
                autoSubmitExam();
            } else {
                setTimeLeft(distance);
                const hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((distance % (1000 * 60)) / 1000);
                setDurationText(`${hrs > 0 ? hrs + 'h ' : ''}${mins}m ${secs}s`);
                setProgress((distance / totalDurationMs) * 100);
            }
        }, 1000);
    };

    const [savingStatus, setSavingStatus] = useState(''); // '', 'Saving...', 'Saved'

    const handleOptionSelect = async (questionId, optionId) => {
        setAnswers({ ...answers, [questionId]: optionId });
        setSavingStatus('Saving...');
        try {
            await api.post(`exams/${id}/submit_answer/`, {
                question_id: questionId,
                selected_option_id: optionId
            });
            setSavingStatus('Saved');
            setTimeout(() => setSavingStatus(''), 2000);
        } catch (err) {
            console.error("Failed to auto-save answer", err);
            setSavingStatus('Error Saving');
        }
    };

    const handleTextAnswerBlur = async (questionId, text, type) => {
        setSavingStatus('Saving...');
        try {
            await api.post(`exams/${id}/submit_answer/`, {
                question_id: questionId,
                selected_option_id: null,
                descriptive_text: type === 'DESC' ? text : null,
                code_submission: type === 'CODE' ? text : null,
            });
            setSavingStatus('Saved');
            setTimeout(() => setSavingStatus(''), 2000);
        } catch (err) {
            console.error("Failed to auto-save text answer", err);
            setSavingStatus('Error Saving');
        }
    };

    const submitExamManually = async () => {
        if (window.confirm("Are you sure you want to completely finish and submit the exam?")) {
            autoSubmitExam();
        }
    }

    const autoSubmitExam = async () => {
        try {
            await api.post(`exams/${id}/submit_exam/`);
            alert("Exam submitted successfully!");
            navigate('/dashboard');
        } catch (err) {
            alert("Failed to submit exam.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light py-12 px-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary shadow-lg mb-6"></div>
            <h4 className="mt-4 text-2xl text-primary font-bold">Setting up secure environment...</h4>
            <p className="text-gray-500 mt-2">Please wait while we prepare your assessment.</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen py-16 px-4 bg-background-light flex items-start justify-center">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-10 text-center">
                <div className="mb-6 text-red-500">
                    <span className="material-symbols-outlined text-7xl">warning</span>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-gray-900">Access Denied</h3>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 font-medium">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-primary hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:-translate-y-1"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    if (!proctoringSetupDone) {
        return (
            <div className="min-h-[80vh] py-12 px-4 bg-background-light flex justify-center items-center">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden self-start mt-8">
                    <div className="bg-primary text-white p-6 flex items-center">
                        <span className="material-symbols-outlined mr-3 text-3xl">security</span>
                        <h3 className="text-2xl font-bold m-0">Security Verification</h3>
                    </div>
                    <div className="p-8">
                        <h4 className="font-bold text-xl mb-6 text-gray-900">Before you begin, please review the rules:</h4>

                        <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500 mb-8">
                            <ul className="space-y-4 text-gray-700 text-lg">
                                {proctoringSettings?.full_screen_enforced && (
                                    <li className="flex items-center"><span className="material-symbols-outlined text-primary mr-3 text-2xl">fullscreen</span> <strong>Full Screen Required:</strong>&nbsp;You must not exit full screen mode.</li>
                                )}
                                {proctoringSettings?.webcam_enabled && (
                                    <li className="flex items-center"><span className="material-symbols-outlined text-red-500 mr-3 text-2xl">videocam</span> <strong>Webcam Monitoring:</strong>&nbsp;Your webcam will be active and record snapshots periodically.</li>
                                )}
                                {proctoringSettings?.screen_record_enabled && (
                                    <li className="flex items-center"><span className="material-symbols-outlined text-yellow-500 mr-3 text-2xl">present_to_all</span> <strong>Screen Sharing:</strong>&nbsp;You will be asked to share your screen. Select entire screen or tab.</li>
                                )}
                                <li className="flex items-center"><span className="material-symbols-outlined text-green-500 mr-3 text-2xl">tab</span> <strong>No Tab Switching:</strong>&nbsp;Navigating away from the exam tab will be flagged as a violation.</li>
                                <li className="flex items-center"><span className="material-symbols-outlined text-gray-600 mr-3 text-2xl">content_paste_off</span> <strong>No Copy/Paste:</strong>&nbsp;Attempting to paste external code is prohibited.</li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex items-center mb-10 text-yellow-800">
                            <span className="material-symbols-outlined text-yellow-600 text-3xl mr-4">info</span>
                            <span className="text-lg font-medium">After <strong>{proctoringSettings?.tolerance_count || 3}</strong> recorded violations, your exam will be automatically submitted without warning.</span>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={setupProctoring}
                                className="bg-primary hover:bg-blue-700 text-white text-xl font-bold py-4 px-10 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center mx-auto"
                            >
                                I Agree, Start Now <span className="material-symbols-outlined ml-2">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
                <div className="w-full h-1.5 bg-gray-200">
                    <div
                        className={`h-full transition-all duration-1000 ${progress < 20 ? 'bg-red-500' : progress < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-primary m-0 hidden md:block">Exam Session in Progress</h2>
                        <div className="bg-red-100 text-red-800 border border-red-200 shadow-sm px-4 py-2 rounded-full flex items-center font-bold text-lg">
                            <span className="material-symbols-outlined mr-2">schedule</span>
                            Time Remaining: {durationText}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="flex items-center gap-3">
                            {mediaStream && (
                                <div className="hidden md:block w-20 h-14 bg-black rounded-lg overflow-hidden border-2 border-primary shadow-sm">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                </div>
                            )}
                            {savingStatus && (
                                <div className={`px-4 py-1.5 rounded-full font-semibold text-sm flex items-center shadow-sm ${savingStatus === 'Saved' ? 'bg-green-100 text-green-800 border border-green-200' :
                                        savingStatus === 'Error Saving' ? 'bg-red-100 text-red-800 border border-red-200' :
                                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    }`}>
                                    {savingStatus === 'Saving...' && <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent mr-2"></div>}
                                    {savingStatus}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={submitExamManually}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow flex items-center transition-colors whitespace-nowrap"
                        >
                            Finish Exam <span className="material-symbols-outlined ml-2">done_all</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="max-w-4xl mx-auto px-4 mt-8">
                {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-primary overflow-hidden mb-8">
                        <div className="p-6 md:p-10">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-bold text-gray-500 text-lg uppercase tracking-wider">Question {idx + 1}</h5>
                                <span className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full border border-gray-200">
                                    {q.marks} Marks
                                </span>
                            </div>
                            <h4 className="text-xl md:text-2xl font-medium text-gray-900 mb-8 leading-relaxed whitespace-pre-wrap">{q.text}</h4>

                            {q.question_type === 'MCQ' || q.question_type === 'TF' ? (
                                <div className="flex flex-col gap-4">
                                    {q.options.map((opt, oIdx) => {
                                        const isSelected = answers[q.id] === opt.id;
                                        return (
                                            <div
                                                key={opt.id}
                                                onClick={() => handleOptionSelect(q.id, opt.id)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group flex items-center ${isSelected
                                                        ? 'bg-blue-50 border-primary shadow-sm'
                                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-blue-400'
                                                    }`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                </div>
                                                <span className={`text-lg font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                                    {String.fromCharCode(65 + oIdx)}. {opt.text}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    <textarea
                                        rows={6}
                                        placeholder={`Write your ${q.question_type === 'CODE' ? 'code snippet' : 'descriptive answer'} here...`}
                                        defaultValue={answers[q.id] || ''}
                                        className={`w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow ${q.question_type === 'CODE' ? 'font-mono bg-gray-900 text-gray-100' : 'bg-gray-50'
                                            }`}
                                        onBlur={(e) => {
                                            setAnswers({ ...answers, [q.id]: e.target.value });
                                            handleTextAnswerBlur(q.id, e.target.value, q.question_type);
                                        }}
                                    ></textarea>
                                    <p className="text-gray-500 text-sm mt-3 flex items-center">
                                        <span className="material-symbols-outlined text-sm mr-1">info</span>
                                        Answer is automatically saved when you click outside the box.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                <div className="text-center mt-12 mb-8">
                    <button
                        onClick={submitExamManually}
                        className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-10 rounded-xl shadow-lg transition-transform hover:-translate-y-1 inline-flex items-center"
                    >
                        <span className="material-symbols-outlined mr-2">task_alt</span>
                        Finally Submit Assessment
                    </button>
                    <p className="text-gray-500 mt-4 text-sm font-medium">Please ensure you have answered all questions before submitting.</p>
                </div>
            </div>
        </div>
    );
}
