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

    const [isUploading, setIsUploading] = useState(false);
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');

    const [doubts, setDoubts] = useState([]);
    const [newDoubt, setNewDoubt] = useState({ title: '', description: '', referenceUrl: '' });
    const [answerInputs, setAnswerInputs] = useState({});
    const [replyInputs, setReplyInputs] = useState({}); 
    const [isPosting, setIsPosting] = useState(false);

    // 🔥 NEW STATE: Tracks which doubts are currently expanded
    const [expandedDoubts, setExpandedDoubts] = useState({});

    const fetchClassDetails = async () => {
        try {
            const { data } = await api.get(`/classes/${id}`);
            setClassData(data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const fetchSubjectDoubts = async (subjectName) => {
        try {
            const { data } = await api.get(`/doubts/${id}/${subjectName}`);
            setDoubts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    useEffect(() => {
        if (selectedCourse) fetchSubjectDoubts(selectedCourse.subjectName);
    }, [selectedCourse]);

    // Toggle expand/collapse for a specific doubt
    const toggleDoubt = (doubtId) => {
        setExpandedDoubts(prev => ({ ...prev, [doubtId]: !prev[doubtId] }));
    };

    const isAdvisor = user.role === 'advisor';
    const isCourseTeacher = user.role === 'teacher' && user._id === selectedCourse?.user?._id;
    const canModerate = isAdvisor || isCourseTeacher;

    const handleDeleteMaterial = async (materialId) => {
        if (window.confirm('Delete this material?')) {
            try {
                await api.delete(`/classes/${id}/materials/${materialId}`);
                fetchClassDetails();
            } catch (err) { alert('Failed to delete material'); }
        }
    };

    const handleDeleteDoubt = async (doubtId) => {
        if (window.confirm('Delete this entire discussion thread?')) {
            try {
                await api.delete(`/doubts/${doubtId}`);
                fetchSubjectDoubts(selectedCourse.subjectName);
            } catch (err) { alert('Failed to delete doubt. Ensure your backend is updated!'); }
        }
    };

    const handleDeleteAnswer = async (doubtId, answerId) => {
        if (window.confirm('Delete this answer?')) {
            try {
                await api.delete(`/doubts/${doubtId}/answers/${answerId}`);
                fetchSubjectDoubts(selectedCourse.subjectName);
            } catch (err) { alert('Failed to delete answer. Ensure your backend is updated!'); }
        }
    };

    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${id}/materials`, { title: matTitle, fileUrl: matUrl, folderSubject: selectedCourse.subjectName });
            setMatTitle(''); setMatUrl(''); setIsUploading(false);
            fetchClassDetails();
        } catch (err) { alert('Failed to upload material'); }
    };

    const handleAskDoubt = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            await api.post('/doubts', { classId: id, subjectFolder: selectedCourse.subjectName, ...newDoubt });
            setNewDoubt({ title: '', description: '', referenceUrl: '' });
            fetchSubjectDoubts(selectedCourse.subjectName);
        } catch (err) { alert('Failed to post doubt'); } 
        finally { setIsPosting(false); }
    };

    const handleAnswerDoubt = async (e, doubtId) => {
        e.preventDefault();
        try {
            await api.post(`/doubts/${doubtId}/answers`, { 
                text: answerInputs[doubtId]?.text || '', referenceUrl: answerInputs[doubtId]?.referenceUrl || ''
            });
            setAnswerInputs({ ...answerInputs, [doubtId]: { text: '', referenceUrl: '' } });
            
            // Automatically expand the doubt to show the new answer
            setExpandedDoubts(prev => ({ ...prev, [doubtId]: true }));
            fetchSubjectDoubts(selectedCourse.subjectName);
        } catch (err) { alert('Failed to post answer'); }
    };

    const handleReplySubmit = async (e, doubtId, answerId) => {
        e.preventDefault();
        try {
            await api.post(`/doubts/${doubtId}/answers/${answerId}/replies`, { text: replyInputs[answerId] });
            setReplyInputs({ ...replyInputs, [answerId]: '' });
            fetchSubjectDoubts(selectedCourse.subjectName);
        } catch (err) { alert('Failed to post reply'); }
    };

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
                
                {/* --- GRID VIEW (Class Overview) --- */}
                {!selectedCourse && (
                    <>
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10">
                            <div className="relative z-10">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{classData.className}</h1>
                                <p className="text-slate-400 text-lg">Class Advisor: {classData.advisor?.name}</p>
                                {isAdvisor && (
                                    <div className="mt-4 inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-xs font-bold uppercase tracking-widest text-brand-300">Join Code</span>
                                        <span className="text-xl font-mono font-bold tracking-[0.2em]">{classData.groupCode}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2 flex items-center gap-3"><span className="text-3xl">📁</span> Course Repository</h2>
                            {classData.teachers.length === 0 ? (
                                <div className="bg-white/50 rounded-[32px] p-20 text-center border-2 border-dashed border-brand-300">
                                    <p className="text-slate-400">No teachers have joined this classroom yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classData.teachers.map((teacherObj, index) => (
                                        <div key={index} onClick={() => { setSelectedCourse(teacherObj); setCourseTab('materials'); }} className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-500 transition-all duration-300 cursor-pointer group">
                                            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-500 font-bold text-2xl mb-6 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                {teacherObj.subjectName.charAt(0)}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-800 leading-tight mb-2">{teacherObj.subjectName}</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Prof. {teacherObj.user?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* --- SUBJECT WORKSPACE --- */}
                {selectedCourse && (
                    <div className="animate-fade-in-up">
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl mb-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="px-3 py-1 bg-brand-500 text-slate-900 text-[10px] font-black uppercase rounded-lg tracking-widest mb-4 inline-block">Active Workspace</span>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{selectedCourse.subjectName}</h1>
                                <p className="text-brand-300 text-lg">Instructor: Prof. {selectedCourse.user?.name}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 px-2">
                            <button onClick={() => setCourseTab('materials')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${courseTab === 'materials' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>📚 Study Materials</button>
                            <button onClick={() => setCourseTab('doubts')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${courseTab === 'doubts' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>💬 Discussion Forum</button>
                        </div>

                        {/* TAB 1: MATERIALS */}
                        {courseTab === 'materials' && (
                            <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm">
                                <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-100">
                                    <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                                    {isCourseTeacher && (
                                        <button onClick={() => setIsUploading(!isUploading)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 text-sm">
                                            {isUploading ? 'Cancel Upload' : '+ Upload Material'}
                                        </button>
                                    )}
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {courseMaterials.map((mat) => (
                                                <div key={mat._id} className="flex items-center justify-between bg-brand-50 p-4 rounded-2xl border border-brand-100">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-2xl">📄</span>
                                                        <span className="font-bold text-slate-700 truncate">{mat.title}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0 ml-4">
                                                        <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-brand-600 text-xs font-black uppercase rounded-lg border border-brand-200 hover:bg-brand-500 hover:text-white transition-all">Open</a>
                                                        {canModerate && (
                                                            <button onClick={() => handleDeleteMaterial(mat._id)} className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* TAB 2: DOUBTS FORUM */}
                        {courseTab === 'doubts' && (
                            <div className="space-y-8">
                                {user.role === 'student' && (
                                    <div className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-sm">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6">Ask a Question</h3>
                                        <form onSubmit={handleAskDoubt} className="flex flex-col gap-4">
                                            <input type="text" placeholder="Question Title..." value={newDoubt.title} onChange={(e) => setNewDoubt({...newDoubt, title: e.target.value})} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <textarea placeholder="Describe your doubt..." value={newDoubt.description} onChange={(e) => setNewDoubt({...newDoubt, description: e.target.value})} rows="3" required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <input type="url" placeholder="Optional: Link to reference image" value={newDoubt.referenceUrl} onChange={(e) => setNewDoubt({...newDoubt, referenceUrl: e.target.value})} className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm" />
                                            <button type="submit" disabled={isPosting} className="self-end px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">Post Question</button>
                                        </form>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
                                    Discussion Thread <span className="bg-brand-500 text-xs px-2 py-0.5 rounded-full">{doubts.length}</span>
                                </h3>

                                {doubts.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-12 text-center">
                                        <p className="text-slate-400 font-medium">No questions asked in this subject yet.</p>
                                    </div>
                                ) : (
                                    doubts.map((doubt) => {
                                        const isAuthor = doubt.postedBy?._id === user._id;

                                        return (
                                            <div key={doubt._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-brand-200 relative">
                                                
                                                {(canModerate || isAuthor) && (
                                                    <button onClick={() => handleDeleteDoubt(doubt._id)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors z-10" title="Delete Discussion">🗑️</button>
                                                )}

                                                <div className="p-8">
                                                    <div className="flex justify-between items-start mb-4 pr-10">
                                                        <h4 className="text-xl font-bold text-slate-800 leading-tight">{doubt.title}</h4>
                                                    </div>
                                                    <p className="text-slate-600 mb-4">{doubt.description}</p>
                                                    
                                                    {doubt.referenceUrl && (
                                                        <a href={doubt.referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 font-bold mb-6 hover:text-slate-900">
                                                            <span>🔗</span> View Attached Reference
                                                        </a>
                                                    )}

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-brand-300 rounded-full flex items-center justify-center font-bold text-slate-700 text-xs">{doubt.postedBy?.name?.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 leading-none">{doubt.postedBy?.name}</p>
                                                            <p className="text-[10px] text-slate-400 capitalize">{doubt.postedBy?.role}</p>
                                                        </div>
                                                    </div>

                                                    {/* 🔥 COLLAPSIBLE BUTTON HERE */}
                                                    <button 
                                                        onClick={() => toggleDoubt(doubt._id)}
                                                        className="mt-6 px-4 py-2 bg-brand-100 text-brand-600 font-bold text-xs rounded-xl hover:bg-brand-500 hover:text-white transition-all"
                                                    >
                                                        {expandedDoubts[doubt._id] ? 'Hide Solutions' : `View Solutions (${doubt.answers.length})`}
                                                    </button>

                                                    {/* 🔥 HIDDEN ANSWERS SECTION (Revealed on click) */}
                                                    {expandedDoubts[doubt._id] && (
                                                        <div className="mt-6 pt-6 border-t border-brand-100 animate-fade-in-up">
                                                            <div className="space-y-6">
                                                                {doubt.answers.map((ans) => (
                                                                    <div key={ans._id} className="bg-brand-50 p-5 rounded-2xl relative border border-brand-100 group">
                                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-l-2xl"></div>
                                                                        
                                                                        {(canModerate || ans.answeredBy?._id === user._id) && (
                                                                            <button onClick={() => handleDeleteAnswer(doubt._id, ans._id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                                                        )}

                                                                        <p className="text-slate-700 text-sm mb-3 pr-6">{ans.text}</p>
                                                                        {ans.referenceUrl && (
                                                                            <a href={ans.referenceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-600 font-bold mb-3">🔗 Solution Reference</a>
                                                                        )}
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">— {ans.answeredBy?.name}</p>

                                                                        {/* NESTED REPLIES */}
                                                                        {ans.replies && ans.replies.length > 0 && (
                                                                            <div className="ml-4 pl-4 border-l-2 border-brand-200 space-y-3 mb-4">
                                                                                {ans.replies.map((reply, rIdx) => (
                                                                                    <div key={rIdx} className="text-xs text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-brand-100">
                                                                                        <p className="mb-1">{reply.text}</p>
                                                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">— {reply.repliedBy?.name}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {/* Reply Box */}
                                                                        <form onSubmit={(e) => handleReplySubmit(e, doubt._id, ans._id)} className="flex gap-2 ml-4">
                                                                            <input type="text" placeholder="Reply to this solution..." value={replyInputs[ans._id] || ''} onChange={(e) => setReplyInputs({...replyInputs, [ans._id]: e.target.value})} required className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-brand-500" />
                                                                            <button type="submit" className="px-4 py-2 bg-brand-100 text-brand-600 font-bold text-xs rounded-lg hover:bg-brand-500 hover:text-white">Reply</button>
                                                                        </form>
                                                                    </div>
                                                                ))}

                                                                {/* MAIN ANSWER BOX */}
                                                                {!isAuthor && (
                                                                    <form onSubmit={(e) => handleAnswerDoubt(e, doubt._id)} className="flex flex-col md:flex-row gap-3 mt-6 border-t border-brand-100 pt-6">
                                                                        <div className="flex-1 flex flex-col gap-2">
                                                                            <input type="text" placeholder="Provide a new solution..." value={answerInputs[doubt._id]?.text || ''} onChange={(e) => setAnswerInputs(prev => ({...prev, [doubt._id]: {...prev[doubt._id], text: e.target.value}}))} required className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                                                            <input type="url" placeholder="Optional: Solution Image Link" value={answerInputs[doubt._id]?.referenceUrl || ''} onChange={(e) => setAnswerInputs(prev => ({...prev, [doubt._id]: {...prev[doubt._id], referenceUrl: e.target.value}}))} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                                                                        </div>
                                                                        <button type="submit" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 self-start md:self-stretch">Submit Solution</button>
                                                                    </form>
                                                                )}
                                                            </div>
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