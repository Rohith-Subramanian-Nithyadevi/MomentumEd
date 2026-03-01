import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ClassDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedCourse, setSelectedCourse] = useState(null); 
    const [courseTab, setCourseTab] = useState('materials'); 

    // --- ANNOUNCEMENTS & POLLS STATES ---
    const [showAnnounceForm, setShowAnnounceForm] = useState(false);
    const [annTitle, setAnnTitle] = useState('');
    const [annContent, setAnnContent] = useState('');
    const [isPoll, setIsPoll] = useState(false);
    const [pollOptions, setPollOptions] = useState(['', '']); // Start with 2 empty options

    // --- ADVISOR: TIMETABLE & ROSTER ---
    const [isEditingTimetable, setIsEditingTimetable] = useState(false);
    const [numPeriods, setNumPeriods] = useState(6);
    const [scheduleData, setScheduleData] = useState({}); 
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const [students, setStudents] = useState([]);

    // --- WORKSPACE STATES (Materials, Doubts, Assignments) ---
    const [isUploading, setIsUploading] = useState(false);
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');
    const [doubts, setDoubts] = useState([]);
    const [newDoubt, setNewDoubt] = useState({ title: '', description: '', referenceUrl: '' });
    const [answerInputs, setAnswerInputs] = useState({});
    const [replyInputs, setReplyInputs] = useState({}); 
    const [isPosting, setIsPosting] = useState(false);
    const [expandedDoubts, setExpandedDoubts] = useState({});
    const [assignments, setAssignments] = useState([]);
    const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', referenceUrl: '', dueDate: '' });
    const [submissionInputs, setSubmissionInputs] = useState({});
    const [expandedAssignments, setExpandedAssignments] = useState({}); 

    // --- FETCH DATA ---
    const fetchClassDetails = async () => {
        try {
            const { data } = await api.get(`/classes/${id}`);
            setClassData(data); setLoading(false);
        } catch (err) { setLoading(false); }
    };
    const fetchStudents = async () => {
        try { const { data } = await api.get(`/classes/${id}/students`); setStudents(data); } catch (err) {}
    };
    const fetchSubjectData = async (subjectName) => {
        try {
            const [doubtsRes, assignmentsRes] = await Promise.all([
                api.get(`/doubts/${id}/${subjectName}`), api.get(`/assignments/${id}/${subjectName}`)
            ]);
            setDoubts(doubtsRes.data); setAssignments(assignmentsRes.data);
        } catch (err) {}
    };

    useEffect(() => {
        fetchClassDetails();
        if (user?.role === 'advisor') fetchStudents();
    }, [id, user]);

    useEffect(() => {
        if (selectedCourse) fetchSubjectData(selectedCourse.subjectName);
    }, [selectedCourse]);

    // --- HELPERS ---
    const toggleDoubt = (doubtId) => setExpandedDoubts(prev => ({ ...prev, [doubtId]: !prev[doubtId] }));
    const toggleAssignment = (assignmentId) => setExpandedAssignments(prev => ({ ...prev, [assignmentId]: !prev[assignmentId] }));

    const isAdvisor = user?.role === 'advisor';
    const isCourseTeacher = user?.role === 'teacher' && user._id === selectedCourse?.user?._id;
    const canModerate = isAdvisor || isCourseTeacher;

    // --- ANNOUNCEMENT & POLL HANDLERS ---
    const handlePollOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };
    const addPollOption = () => setPollOptions([...pollOptions, '']);
    const removePollOption = (index) => setPollOptions(pollOptions.filter((_, i) => i !== index));

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            // Filter out empty options if it's a poll
            const validOptions = isPoll ? pollOptions.filter(opt => opt.trim() !== '') : [];
            if (isPoll && validOptions.length < 2) return alert("Polls require at least 2 valid options.");

            await api.post(`/classes/${id}/announcements`, { 
                title: annTitle, content: annContent, isPoll, pollOptions: validOptions 
            });
            setAnnTitle(''); setAnnContent(''); setIsPoll(false); setPollOptions(['', '']); setShowAnnounceForm(false);
            fetchClassDetails();
        } catch (err) { alert('Failed to post announcement'); }
    };

    const handleDeleteAnnouncement = async (annId) => {
        if (window.confirm("Delete this announcement?")) {
            try { await api.delete(`/classes/${id}/announcements/${annId}`); fetchClassDetails(); } catch (err) { alert('Failed to delete'); }
        }
    };

    const handleVote = async (announcementId, optionId) => {
        try {
            await api.post(`/classes/${id}/announcements/${announcementId}/vote`, { optionId });
            fetchClassDetails(); // Refresh to show new vote counts
        } catch (err) { alert('Failed to cast vote'); }
    };

    // --- TIMETABLE, ROSTER, CLASS HANDLERS ---
    const generateGrid = () => {
        const initial = {}; daysOfWeek.forEach(day => { initial[day] = Array(Number(numPeriods)).fill(''); }); setScheduleData(initial);
    };
    const handleCellChange = (day, index, value) => {
        setScheduleData(prev => { const newDay = [...(prev[day] || [])]; newDay[index] = value; return { ...prev, [day]: newDay }; });
    };
    const handleSaveTimetable = async () => {
        try { await api.put(`/classes/${id}/timetable`, { timetableData: scheduleData }); setIsEditingTimetable(false); fetchClassDetails(); } catch (err) { alert('Failed to save'); }
    };
    const handleRemoveUser = async (userId, role) => {
        if (window.confirm(`Are you sure you want to remove this ${role} from the classroom?`)) {
            try { await api.delete(`/classes/${id}/remove-user/${userId}`); fetchClassDetails(); if (role === 'student') fetchStudents(); } catch (err) { alert('Failed to remove'); }
        }
    };
    const handleDeleteClass = async () => {
        if (window.confirm('Delete this entire class?')) {
            try { await api.delete(`/classes/${id}`); navigate('/dashboard'); } catch (err) { alert('Failed to delete class'); }
        }
    };

    // --- WORKSPACE HANDLERS (Materials, Doubts, Assignments) ---
    const handleDeleteMaterial = async (matId) => { if (window.confirm('Delete?')) { try { await api.delete(`/classes/${id}/materials/${matId}`); fetchClassDetails(); } catch(err){} } };
    const handleUploadMaterial = async (e) => { e.preventDefault(); try { await api.post(`/classes/${id}/materials`, { title: matTitle, fileUrl: matUrl, folderSubject: selectedCourse.subjectName }); setMatTitle(''); setMatUrl(''); setIsUploading(false); fetchClassDetails(); } catch(err){} };
    const handleAskDoubt = async (e) => { e.preventDefault(); setIsPosting(true); try { await api.post('/doubts', { classId: id, subjectFolder: selectedCourse.subjectName, ...newDoubt }); setNewDoubt({ title: '', description: '', referenceUrl: '' }); fetchSubjectData(selectedCourse.subjectName); } catch(err){} finally { setIsPosting(false); } };
    const handleDeleteDoubt = async (doubtId) => { if (window.confirm('Delete?')) { try { await api.delete(`/doubts/${doubtId}`); fetchSubjectData(selectedCourse.subjectName); } catch(err){} } };
    const handleAnswerDoubt = async (e, doubtId) => { e.preventDefault(); try { await api.post(`/doubts/${doubtId}/answers`, { text: answerInputs[doubtId]?.text || '', referenceUrl: answerInputs[doubtId]?.referenceUrl || '' }); setAnswerInputs({ ...answerInputs, [doubtId]: { text: '', referenceUrl: '' } }); setExpandedDoubts(prev => ({ ...prev, [doubtId]: true })); fetchSubjectData(selectedCourse.subjectName); } catch(err){} };
    const handleReplySubmit = async (e, doubtId, answerId) => { e.preventDefault(); try { await api.post(`/doubts/${doubtId}/answers/${answerId}/replies`, { text: replyInputs[answerId] }); setReplyInputs({ ...replyInputs, [answerId]: '' }); fetchSubjectData(selectedCourse.subjectName); } catch(err){} };
    const handleDeleteAnswer = async (doubtId, answerId) => { if (window.confirm('Delete?')) { try { await api.delete(`/doubts/${doubtId}/answers/${answerId}`); fetchSubjectData(selectedCourse.subjectName); } catch(err){} } };
    const handleCreateAssignment = async (e) => { e.preventDefault(); try { await api.post('/assignments', { classId: id, subjectFolder: selectedCourse.subjectName, ...newAssignment }); setNewAssignment({ title: '', description: '', referenceUrl: '', dueDate: '' }); setIsCreatingAssignment(false); fetchSubjectData(selectedCourse.subjectName); } catch(err){} };
    const handleDeleteAssignment = async (assignmentId) => { if (window.confirm('Delete?')) { try { await api.delete(`/assignments/${assignmentId}`); fetchSubjectData(selectedCourse.subjectName); } catch(err){} } };
    const handleSubmitAssignment = async (e, assignmentId) => { e.preventDefault(); try { await api.post(`/assignments/${assignmentId}/submit`, { fileUrl: submissionInputs[assignmentId] }); setSubmissionInputs({ ...submissionInputs, [assignmentId]: '' }); alert('Assignment submitted successfully!'); fetchSubjectData(selectedCourse.subjectName); } catch(err){} };

    if (loading) return <div className="min-h-screen bg-brand-100 flex items-center justify-center"><p className="text-slate-400 font-bold animate-pulse">Loading Workspace...</p></div>;
    if (!classData) return <div className="min-h-screen bg-brand-100 flex items-center justify-center"><p className="text-red-500 font-bold">Classroom not found.</p></div>;

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-20">
            <nav className="bg-white/70 backdrop-blur-md border-b border-brand-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    {selectedCourse ? (
                        <button onClick={() => setSelectedCourse(null)} className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <span className="text-xl">⬅</span> Back to Class Overview
                        </button>
                    ) : (
                        <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <span className="text-xl">⬅</span> Back to Dashboard
                        </Link>
                    )}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-10">
                
                {/* ========================================= */}
                {/* GRID VIEW (Main Class Overview)           */}
                {/* ========================================= */}
                {!selectedCourse && (
                    <>
                        {/* HEADER */}
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{classData.className}</h1>
                                    <p className="text-slate-400 text-lg">Class Advisor: {classData.advisor?.name}</p>
                                    {isAdvisor && (
                                        <div className="mt-4 inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                            <span className="text-xs font-bold uppercase tracking-widest text-brand-300">Join Code</span>
                                            <span className="text-xl font-mono font-bold tracking-[0.2em]">{classData.groupCode}</span>
                                        </div>
                                    )}
                                </div>
                                {isAdvisor && (
                                    <button onClick={handleDeleteClass} className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95">Delete Classroom</button>
                                )}
                            </div>
                        </div>

                        {/* --- ANNOUNCEMENTS & POLLS BOARD --- */}
                        <section className="mb-10">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl">📢</span> Class Announcements</h2>
                                {isAdvisor && (
                                    <button onClick={() => setShowAnnounceForm(!showAnnounceForm)} className="px-5 py-2 bg-brand-500 text-slate-900 font-bold rounded-xl text-sm hover:bg-brand-400 transition-colors shadow-md">
                                        {showAnnounceForm ? 'Cancel' : '+ New Announcement'}
                                    </button>
                                )}
                            </div>

                            {/* Post Announcement/Poll Form (Advisor Only) */}
                            {showAnnounceForm && isAdvisor && (
                                <div className="bg-white p-6 md:p-8 rounded-[32px] border border-brand-200 shadow-sm mb-6 animate-fade-in-up">
                                    <form onSubmit={handleCreateAnnouncement} className="flex flex-col gap-4">
                                        <input type="text" placeholder="Subject / Title..." value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl font-bold text-slate-800" />
                                        <textarea placeholder="Write your announcement details here..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} rows="3" required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                        
                                        <div className="flex items-center gap-3 mt-2">
                                            <input type="checkbox" id="pollToggle" checked={isPoll} onChange={() => setIsPoll(!isPoll)} className="w-5 h-5 accent-brand-500 cursor-pointer" />
                                            <label htmlFor="pollToggle" className="text-sm font-bold text-slate-700 cursor-pointer">Make this a voting poll?</label>
                                        </div>

                                        {isPoll && (
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mt-2">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Poll Options</p>
                                                {pollOptions.map((opt, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => handlePollOptionChange(idx, e.target.value)} required className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                                                        {pollOptions.length > 2 && ( <button type="button" onClick={() => removePollOption(idx)} className="px-3 bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">🗑️</button> )}
                                                    </div>
                                                ))}
                                                <button type="button" onClick={addPollOption} className="text-xs font-bold text-brand-600 hover:text-brand-800">+ Add another option</button>
                                            </div>
                                        )}

                                        <button type="submit" className="self-end px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 mt-2">Publish to Class</button>
                                    </form>
                                </div>
                            )}

                            {/* Announcements List */}
                            <div className="space-y-4">
                                {!classData.announcements || classData.announcements.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-10 text-center">
                                        <p className="text-slate-400 font-medium">No announcements posted yet.</p>
                                    </div>
                                ) : (
                                    classData.announcements.map((ann) => {
                                        // Calculate total votes if it's a poll
                                        const totalVotes = ann.isPoll ? ann.pollOptions.reduce((sum, opt) => sum + opt.votes.length, 0) : 0;
                                        
                                        return (
                                            <div key={ann._id} className="bg-white p-6 md:p-8 rounded-[32px] border border-brand-200 shadow-sm relative group">
                                                {isAdvisor && ( <button onClick={() => handleDeleteAnnouncement(ann._id)} className="absolute top-6 right-6 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity">🗑️ Delete</button> )}
                                                
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-xl">📢</div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-800 leading-tight">{ann.title}</h3>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ann.createdAt).toLocaleString()} • Class Advisor</p>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 mb-6">{ann.content}</p>

                                                {/* Render Poll UI if applicable */}
                                                {ann.isPoll && (
                                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Live Poll • {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}</p>
                                                        <div className="space-y-3">
                                                            {ann.pollOptions.map((opt) => {
                                                                const voteCount = opt.votes.length;
                                                                const percent = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
                                                                const hasVotedForThis = opt.votes.includes(user?._id);

                                                                return (
                                                                    <div key={opt._id} onClick={() => handleVote(ann._id, opt._id)} className={`relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all ${hasVotedForThis ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-300'}`}>
                                                                        {/* Progress Bar Background */}
                                                                        <div className="absolute left-0 top-0 bottom-0 bg-brand-100 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                                                        
                                                                        <div className="relative z-10 flex justify-between items-center">
                                                                            <span className={`font-bold text-sm ${hasVotedForThis ? 'text-brand-700' : 'text-slate-700'}`}>
                                                                                {hasVotedForThis && '✅ '} {opt.optionText}
                                                                            </span>
                                                                            <span className="text-xs font-bold text-slate-500">{percent}% ({voteCount})</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* --- TIMETABLE WIDGET --- */}
                        <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm mb-10 overflow-x-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl">📅</span> Weekly Timetable</h2>
                                {isAdvisor && (
                                    <button onClick={() => { setIsEditingTimetable(!isEditingTimetable); if(!isEditingTimetable && !classData.timetableData) generateGrid(); }} className="px-6 py-2 bg-brand-100 text-brand-600 font-bold rounded-xl text-sm hover:bg-brand-500 hover:text-white transition-colors">
                                        {isEditingTimetable ? 'Cancel Setup' : 'Configure Timetable'}
                                    </button>
                                )}
                            </div>
                            {isEditingTimetable && isAdvisor && (
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-6 animate-fade-in-up">
                                    <div className="flex items-end gap-4 mb-6">
                                        <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Periods per day</label><input type="number" min="1" max="10" value={numPeriods} onChange={(e) => setNumPeriods(e.target.value)} className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800" /></div>
                                        <button onClick={generateGrid} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors">Generate Grid</button>
                                    </div>
                                    <p className="text-xs text-brand-500 font-bold italic mb-4">Tip: Type "BREAK" into a slot to automatically style it as a break period.</p>
                                    {Object.keys(scheduleData).length > 0 && (
                                        <div className="space-y-4">
                                            {daysOfWeek.map(day => (
                                                <div key={day} className="flex flex-col md:flex-row gap-2 md:items-center">
                                                    <span className="w-24 font-black text-slate-700">{day}</span>
                                                    <div className="flex flex-1 gap-2 overflow-x-auto pb-2 md:pb-0">
                                                        {scheduleData[day]?.map((period, idx) => (
                                                            <input key={idx} type="text" placeholder={`P${idx + 1}`} value={period} onChange={(e) => handleCellChange(day, idx, e.target.value)} className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-center focus:border-brand-500 focus:outline-none" />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={handleSaveTimetable} className="mt-6 px-8 py-3 bg-brand-500 text-slate-900 font-black rounded-xl hover:bg-brand-400 w-full md:w-auto shadow-md">Publish Timetable</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {!isEditingTimetable && classData.timetableData && (
                                <div className="min-w-max border border-brand-100 rounded-2xl overflow-hidden">
                                    {daysOfWeek.map((day, dIdx) => (
                                        <div key={day} className={`flex border-b border-brand-100 ${dIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                            <div className="w-32 px-6 py-4 font-black text-slate-800 border-r border-brand-100 flex items-center">{day}</div>
                                            <div className="flex flex-1">
                                                {classData.timetableData[day]?.map((subject, idx) => (
                                                    <div key={idx} className={`flex-1 min-w-[120px] px-4 py-4 text-center border-r border-brand-100 last:border-r-0 flex items-center justify-center ${subject.toUpperCase() === 'BREAK' ? 'bg-brand-100 text-brand-600 font-black tracking-widest text-[10px]' : 'text-slate-600 font-bold text-sm'}`}>{subject || '-'}</div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isEditingTimetable && !classData.timetableData && <p className="text-slate-500 font-medium italic text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No timetable configured yet.</p>}
                        </div>

                        {/* --- SUBJECT REPOSITORY --- */}
                        <section className="mb-10">
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2 flex items-center gap-3"><span className="text-3xl">📁</span> Course Repository</h2>
                            {classData.teachers.length === 0 ? (
                                <div className="bg-white/50 rounded-[32px] p-20 text-center border-2 border-dashed border-brand-300"><p className="text-slate-400">No teachers have joined this classroom yet.</p></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classData.teachers.map((teacherObj, index) => (
                                        <div key={index} onClick={() => { setSelectedCourse(teacherObj); setCourseTab('materials'); }} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-500 transition-all duration-300 cursor-pointer group">
                                            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-500 font-bold text-2xl mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">{teacherObj.subjectName.charAt(0)}</div>
                                            <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-2">{teacherObj.subjectName}</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Prof. {teacherObj.user?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* --- ADVISOR: CLASS ROSTER --- */}
                        {isAdvisor && (
                            <section className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm mb-10">
                                <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3"><span className="text-3xl">👥</span> Class Roster & Moderation</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div>
                                        <h3 className="text-sm font-black text-brand-500 uppercase tracking-widest mb-4 border-b border-brand-100 pb-2 flex justify-between"><span>Faculty & Instructors</span><span className="text-slate-400">{classData.teachers.length}</span></h3>
                                        {classData.teachers.length === 0 ? <p className="text-slate-400 italic text-sm">No teachers enrolled.</p> : (
                                            <ul className="space-y-3">
                                                {classData.teachers.map((t, i) => (
                                                    <li key={i} className="flex justify-between items-center bg-brand-50 p-3 rounded-xl border border-brand-100 group">
                                                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-brand-200 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs">{t.user?.name?.charAt(0)}</div><div><p className="text-sm font-bold text-slate-800 leading-none">{t.user?.name}</p><p className="text-[10px] text-slate-500">{t.subjectName}</p></div></div>
                                                        <button onClick={() => handleRemoveUser(t.user._id, 'teacher')} className="px-3 py-1 bg-white text-red-500 text-xs font-bold rounded-lg border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">Remove</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-brand-100 pb-2 flex justify-between"><span>Registered Students</span><span className="text-slate-400">{students.length}</span></h3>
                                        {students.length === 0 ? <p className="text-slate-400 italic text-sm">No students enrolled yet.</p> : (
                                            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                {students.map((s) => (
                                                    <li key={s._id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 group">
                                                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">{s.name.charAt(0)}</div><div><p className="text-sm font-bold text-slate-800 leading-none">{s.name}</p><p className="text-[10px] text-slate-500">{s.rollNo || s.email}</p></div></div>
                                                        <button onClick={() => handleRemoveUser(s._id, 'student')} className="px-3 py-1 bg-white text-red-500 text-xs font-bold rounded-lg border border-red-100 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">Remove</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* ========================================= */}
                {/* SUBJECT WORKSPACE (Materials, Assignments, Doubts) */}
                {/* ========================================= */}
                {selectedCourse && (
                    <div className="animate-fade-in-up">
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl mb-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="px-3 py-1 bg-brand-500 text-slate-900 text-[10px] font-black uppercase rounded-lg tracking-widest mb-4 inline-block">Active Workspace</span>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{selectedCourse.subjectName}</h1>
                                <p className="text-brand-300 text-lg">Instructor: Prof. {selectedCourse.user?.name}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-4 mb-8 px-2">
                            <button onClick={() => setCourseTab('materials')} className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold transition-all text-sm md:text-base ${courseTab === 'materials' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>📚 Study Materials</button>
                            <button onClick={() => setCourseTab('assignments')} className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold transition-all text-sm md:text-base ${courseTab === 'assignments' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>📝 Assignments</button>
                            <button onClick={() => setCourseTab('doubts')} className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold transition-all text-sm md:text-base ${courseTab === 'doubts' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>💬 Discussion</button>
                        </div>

                        {/* TAB 1: MATERIALS */}
                        {courseTab === 'materials' && (
                            <div className="bg-white rounded-[32px] p-6 md:p-8 border border-brand-200 shadow-sm">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 pb-4 border-b border-brand-100">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-800">Resource Library</h2>
                                    {isCourseTeacher && <button onClick={() => setIsUploading(!isUploading)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 text-sm">{isUploading ? 'Cancel Upload' : '+ Upload Material'}</button>}
                                </div>
                                {isUploading && (
                                    <form onSubmit={handleUploadMaterial} className="bg-brand-50 p-6 rounded-2xl mb-8 border border-brand-200 flex flex-col gap-4">
                                        <input type="text" placeholder="Resource Title..." value={matTitle} onChange={(e) => setMatTitle(e.target.value)} required className="w-full px-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:border-brand-500" />
                                        <input type="url" placeholder="Document Link..." value={matUrl} onChange={(e) => setMatUrl(e.target.value)} required className="w-full px-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:border-brand-500" />
                                        <button type="submit" className="self-end px-8 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400">Save Resource</button>
                                    </form>
                                )}
                                {(() => {
                                    const courseMaterials = classData.materials.filter(m => m.folderSubject === selectedCourse.subjectName);
                                    if (courseMaterials.length === 0) return <p className="text-slate-400 italic text-center py-10">No materials uploaded yet.</p>;
                                    return (
                                        <div className="grid grid-cols-1 gap-3">
                                            {courseMaterials.map((mat) => (
                                                <div key={mat._id} className="flex items-center justify-between bg-brand-50 p-4 rounded-2xl border border-brand-100">
                                                    <div className="flex items-center gap-3 overflow-hidden"><span className="text-2xl">📄</span><span className="font-bold text-slate-700 truncate">{mat.title}</span></div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-brand-600 text-xs font-black uppercase rounded-lg border border-brand-200 hover:bg-brand-500 hover:text-white transition-all">Open</a>
                                                        {canModerate && <button onClick={() => handleDeleteMaterial(mat._id)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">🗑️</button>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* TAB 2: ASSIGNMENTS */}
                        {courseTab === 'assignments' && (
                            <div className="space-y-6 md:space-y-8">
                                {isCourseTeacher && (
                                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-brand-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-slate-800">Create Assignment</h3>
                                            <button onClick={() => setIsCreatingAssignment(!isCreatingAssignment)} className="text-sm font-bold text-brand-600 hover:text-brand-800">{isCreatingAssignment ? 'Cancel' : '+ New Assignment'}</button>
                                        </div>
                                        {isCreatingAssignment && (
                                            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4 animate-fade-in-up">
                                                <input type="text" placeholder="Assignment Title..." value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                                <textarea placeholder="Instructions / Description..." value={newAssignment.description} onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} rows="3" required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Worksheet Link (Optional)</label><input type="url" value={newAssignment.referenceUrl} onChange={(e) => setNewAssignment({...newAssignment, referenceUrl: e.target.value})} className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" /></div>
                                                    <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Due Date</label><input type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" /></div>
                                                </div>
                                                <button type="submit" className="self-end px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 mt-2">Publish Assignment</button>
                                            </form>
                                        )}
                                    </div>
                                )}

                                {assignments.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-12 text-center"><p className="text-slate-400 font-medium">No assignments posted for this subject yet.</p></div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignments.map(assignment => {
                                            const mySubmission = assignment.submissions.find(s => s.student?._id === user?._id);
                                            const isOverdue = new Date(assignment.dueDate) < new Date();
                                            return (
                                                <div key={assignment._id} className="bg-white p-6 md:p-8 rounded-[32px] border border-brand-200 shadow-sm relative group">
                                                    {canModerate && <button onClick={() => handleDeleteAssignment(assignment._id)} className="absolute top-6 right-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">🗑️</button>}
                                                    
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-b border-brand-100 pb-4 pr-12">
                                                        <h4 className="text-xl font-bold text-slate-800">{assignment.title}</h4>
                                                        <div className={`mt-2 md:mt-0 px-3 py-1 rounded-lg text-xs font-bold tracking-widest uppercase inline-block ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm mb-4">{assignment.description}</p>
                                                    {assignment.referenceUrl && <a href={assignment.referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 font-bold mb-6 hover:text-slate-900"><span>🔗</span> View Reference Document</a>}

                                                    {user?.role === 'student' && (
                                                        <div className="mt-4 bg-brand-50 p-5 rounded-2xl border border-brand-100">
                                                            <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">{mySubmission ? '✅ Your Submission' : '📤 Submit Your Work'}</h5>
                                                            <form onSubmit={(e) => handleSubmitAssignment(e, assignment._id)} className="flex flex-col md:flex-row gap-3">
                                                                <input type="url" placeholder="Paste link to your work" value={submissionInputs[assignment._id] || mySubmission?.fileUrl || ''} onChange={(e) => setSubmissionInputs({...submissionInputs, [assignment._id]: e.target.value})} required className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                                                                <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">{mySubmission ? 'Update Submission' : 'Submit'}</button>
                                                            </form>
                                                            {mySubmission && <p className="text-[10px] text-slate-500 mt-2">Last submitted: {new Date(mySubmission.submittedAt).toLocaleString()}</p>}
                                                        </div>
                                                    )}

                                                    {isCourseTeacher && (
                                                        <div className="mt-6 border-t border-brand-100 pt-6">
                                                            <button onClick={() => toggleAssignment(assignment._id)} className="px-6 py-2.5 bg-brand-100 text-brand-600 font-bold text-sm rounded-xl hover:bg-brand-500 hover:text-white transition-all">
                                                                {expandedAssignments[assignment._id] ? '▲ Hide Submissions' : `▼ View Submissions (${assignment.submissions.length})`}
                                                            </button>
                                                            {expandedAssignments[assignment._id] && (
                                                                <div className="mt-6 space-y-3 animate-fade-in-up">
                                                                    {assignment.submissions.length === 0 ? <p className="text-sm text-slate-400 italic">No submissions yet.</p> : 
                                                                        assignment.submissions.map((sub, idx) => (
                                                                            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">{sub.student?.name?.charAt(0)}</div>
                                                                                    <div><p className="text-sm font-bold text-slate-800">{sub.student?.name}</p><p className="text-[10px] text-slate-400">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p></div>
                                                                                </div>
                                                                                <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-brand-600 text-xs font-black uppercase rounded-lg border border-brand-200 hover:bg-brand-500 hover:text-white transition-all text-center">View Work</a>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: DOUBTS (Unchanged from previous iteration) */}
                        {courseTab === 'doubts' && (
                            <div className="space-y-6 md:space-y-8">
                                {user?.role === 'student' && (
                                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-brand-200 shadow-sm">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6">Ask a Question</h3>
                                        <form onSubmit={handleAskDoubt} className="flex flex-col gap-4">
                                            <input type="text" placeholder="Question Title..." value={newDoubt.title} onChange={(e) => setNewDoubt({...newDoubt, title: e.target.value})} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <textarea placeholder="Describe your doubt..." value={newDoubt.description} onChange={(e) => setNewDoubt({...newDoubt, description: e.target.value})} rows="3" required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <input type="url" placeholder="Optional: Link to reference image" value={newDoubt.referenceUrl} onChange={(e) => setNewDoubt({...newDoubt, referenceUrl: e.target.value})} className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <button type="submit" disabled={isPosting} className="self-end px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">Post Question</button>
                                        </form>
                                    </div>
                                )}

                                <h3 className="text-lg md:text-xl font-bold text-slate-800 px-2 flex items-center gap-2">Discussion Thread <span className="bg-brand-500 text-xs px-2 py-0.5 rounded-full">{doubts.length}</span></h3>
                                {doubts.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-12 text-center"><p className="text-slate-400 font-medium">No questions asked in this subject yet.</p></div>
                                ) : (
                                    doubts.map((doubt) => {
                                        const isAuthor = doubt.postedBy?._id === user?._id;
                                        return (
                                            <div key={doubt._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-brand-200 relative">
                                                {(canModerate || isAuthor) && ( <button onClick={() => handleDeleteDoubt(doubt._id)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors z-10">🗑️</button> )}
                                                <div className="p-6 md:p-8">
                                                    <h4 className="text-lg md:text-xl font-bold text-slate-800 leading-tight pr-10 mb-4">{doubt.title}</h4>
                                                    <p className="text-slate-600 mb-4 text-sm md:text-base">{doubt.description}</p>
                                                    {doubt.referenceUrl && ( <a href={doubt.referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs md:text-sm text-brand-600 font-bold mb-6 hover:text-slate-900"><span>🔗</span> View Attached Reference</a> )}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-brand-300 rounded-full flex items-center justify-center font-bold text-slate-700 text-xs">{doubt.postedBy?.name?.charAt(0)}</div>
                                                        <div><p className="text-xs font-bold text-slate-800 leading-none">{doubt.postedBy?.name}</p><p className="text-[10px] text-slate-400 capitalize">{doubt.postedBy?.role}</p></div>
                                                    </div>

                                                    <div className="mt-6 border-t border-brand-100 pt-6">
                                                        <button onClick={() => toggleDoubt(doubt._id)} className="px-4 md:px-6 py-2 md:py-2.5 bg-brand-100 text-brand-600 font-bold text-xs md:text-sm rounded-xl hover:bg-brand-500 hover:text-white transition-all">
                                                            {expandedDoubts[doubt._id] ? '▲ Hide Solutions' : `▼ View Solutions (${doubt.answers.length})`}
                                                        </button>
                                                    </div>

                                                    {expandedDoubts[doubt._id] && (
                                                        <div className="mt-6 space-y-6 animate-fade-in-up">
                                                            {doubt.answers.map((ans) => (
                                                                <div key={ans._id} className="bg-brand-50 p-4 md:p-5 rounded-2xl relative border border-brand-100 group">
                                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-l-2xl"></div>
                                                                    {(canModerate || ans.answeredBy?._id === user?._id) && ( <button onClick={() => handleDeleteAnswer(doubt._id, ans._id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button> )}
                                                                    <p className="text-slate-700 text-sm mb-3 pr-6">{ans.text}</p>
                                                                    {ans.referenceUrl && ( <a href={ans.referenceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-600 font-bold mb-3">🔗 Solution Reference</a> )}
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">— {ans.answeredBy?.name}</p>

                                                                    {ans.replies && ans.replies.length > 0 && (
                                                                        <div className="ml-2 md:ml-4 pl-3 md:pl-4 border-l-2 border-brand-200 space-y-3 mb-4">
                                                                            {ans.replies.map((reply, rIdx) => (
                                                                                <div key={rIdx} className="text-xs text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-brand-100"><p className="mb-1">{reply.text}</p><p className="text-[9px] font-bold text-slate-400 uppercase">— {reply.repliedBy?.name}</p></div>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    <form onSubmit={(e) => handleReplySubmit(e, doubt._id, ans._id)} className="flex gap-2 ml-2 md:ml-4">
                                                                        <input type="text" placeholder="Reply..." value={replyInputs[ans._id] || ''} onChange={(e) => setReplyInputs({...replyInputs, [ans._id]: e.target.value})} required className="flex-1 px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-500" />
                                                                        <button type="submit" className="px-3 md:px-4 py-2 bg-brand-100 text-brand-600 font-bold text-xs rounded-lg hover:bg-brand-500 hover:text-white">Reply</button>
                                                                    </form>
                                                                </div>
                                                            ))}
                                                            {!isAuthor && (
                                                                <form onSubmit={(e) => handleAnswerDoubt(e, doubt._id)} className="flex flex-col md:flex-row gap-3 mt-6">
                                                                    <div className="flex-1 flex flex-col gap-2">
                                                                        <input type="text" placeholder="New solution..." value={answerInputs[doubt._id]?.text || ''} onChange={(e) => setAnswerInputs(prev => ({...prev, [doubt._id]: {...prev[doubt._id], text: e.target.value}}))} required className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                                                        <input type="url" placeholder="Optional: Image Link" value={answerInputs[doubt._id]?.referenceUrl || ''} onChange={(e) => setAnswerInputs(prev => ({...prev, [doubt._id]: {...prev[doubt._id], referenceUrl: e.target.value}}))} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                                                    </div>
                                                                    <button type="submit" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800">Submit</button>
                                                                </form>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassDashboard;