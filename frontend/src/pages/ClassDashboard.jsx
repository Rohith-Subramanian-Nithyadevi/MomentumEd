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

    // --- DRILL-DOWN STATES ---
    const [selectedCourse, setSelectedCourse] = useState(null); // Stores the clicked teacherObj
    const [courseTab, setCourseTab] = useState('materials'); // 'materials' or 'doubts'

    // --- MATERIALS STATES ---
    const [isUploading, setIsUploading] = useState(false);
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');

    // --- DOUBTS STATES ---
    const [doubts, setDoubts] = useState([]);
    const [newDoubt, setNewDoubt] = useState({ title: '', description: '', referenceUrl: '' });
    const [answerInputs, setAnswerInputs] = useState({});
    const [isPosting, setIsPosting] = useState(false);

    // Fetch Base Class Details
    const fetchClassDetails = async () => {
        try {
            const { data } = await api.get(`/classes/${id}`);
            setClassData(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch class details', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    // Fetch Doubts specifically for the clicked Course
    const fetchSubjectDoubts = async (subjectName) => {
        try {
            const { data } = await api.get(`/doubts/${id}/${subjectName}`);
            setDoubts(data);
        } catch (err) {
            console.error('Failed to fetch doubts', err);
        }
    };

    // Watcher: When a course is clicked, fetch its doubts
    useEffect(() => {
        if (selectedCourse) {
            fetchSubjectDoubts(selectedCourse.subjectName);
        }
    }, [selectedCourse]);

    // --- HANDLERS ---
    const handleDeleteClass = async () => {
        if (window.confirm('Are you sure you want to delete this entire class? This cannot be undone.')) {
            try {
                await api.delete(`/classes/${id}`);
                navigate('/dashboard');
            } catch (err) {
                alert('Failed to delete class');
            }
        }
    };

    const handleUploadMaterial = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${id}/materials`, {
                title: matTitle,
                fileUrl: matUrl,
                folderSubject: selectedCourse.subjectName
            });
            setMatTitle('');
            setMatUrl('');
            setIsUploading(false);
            fetchClassDetails(); // Refresh to see the new material
        } catch (err) {
            alert('Failed to upload material');
        }
    };

    const handleAskDoubt = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            await api.post('/doubts', {
                classId: id,
                subjectFolder: selectedCourse.subjectName,
                ...newDoubt
            });
            setNewDoubt({ title: '', description: '', referenceUrl: '' });
            fetchSubjectDoubts(selectedCourse.subjectName);
        } catch (err) {
            alert('Failed to post doubt');
        } finally {
            setIsPosting(false);
        }
    };

    const handleAnswerDoubt = async (e, doubtId) => {
        e.preventDefault();
        try {
            await api.post(`/doubts/${doubtId}/answers`, { 
                text: answerInputs[doubtId]?.text || '',
                referenceUrl: answerInputs[doubtId]?.referenceUrl || ''
            });
            setAnswerInputs({ ...answerInputs, [doubtId]: { text: '', referenceUrl: '' } });
            fetchSubjectDoubts(selectedCourse.subjectName);
        } catch (err) {
            alert('Failed to post answer');
        }
    };

    const handleAnswerChange = (doubtId, field, value) => {
        setAnswerInputs(prev => ({
            ...prev,
            [doubtId]: { ...prev[doubtId], [field]: value }
        }));
    };

    // --- RENDER LOADERS ---
    if (loading) return (
        <div className="min-h-screen bg-brand-100 flex items-center justify-center">
            <p className="text-slate-400 font-bold animate-pulse">Loading Classroom Details...</p>
        </div>
    );

    if (!classData) return (
        <div className="min-h-screen bg-brand-100 flex items-center justify-center">
            <p className="text-red-500 font-bold">Classroom not found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-20">
            {/* --- TOP BAR --- */}
            <nav className="bg-white/70 backdrop-blur-md border-b border-brand-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    {selectedCourse ? (
                        <button onClick={() => setSelectedCourse(null)} className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <span className="text-xl">⬅</span> Back to Course Overview
                        </button>
                    ) : (
                        <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <span className="text-xl">⬅</span> Back to Dashboard
                        </Link>
                    )}
                    <div className="text-slate-400 text-sm font-medium hidden md:block">Classroom ID: {id.slice(-6)}</div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-10">
                
                {/* ========================================= */}
                {/* VIEW 1: MAIN CLASS OVERVIEW (GRID)        */}
                {/* ========================================= */}
                {!selectedCourse && (
                    <>
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-10">
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{classData.className}</h1>
                                    <p className="text-slate-400 text-lg flex items-center gap-2">
                                        <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                                        Class Advisor: {classData.advisor?.name}
                                    </p>
                                    {user.role === 'advisor' && (
                                        <div className="mt-4 inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                            <span className="text-xs font-bold uppercase tracking-widest text-brand-300">Join Code</span>
                                            <span className="text-xl font-mono font-bold tracking-[0.2em]">{classData.groupCode}</span>
                                        </div>
                                    )}
                                </div>
                                {user.role === 'advisor' && (
                                    <button onClick={handleDeleteClass} className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95">
                                        Delete Classroom
                                    </button>
                                )}
                            </div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]"></div>
                        </div>

                        {/* Timetable Widget */}
                        <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm mb-10 group hover:shadow-md transition-shadow flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><span className="text-3xl">📅</span> Weekly Timetable</h2>
                            {classData.timetableUrl ? (
                                <a href={classData.timetableUrl} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-brand-500 text-slate-900 font-bold rounded-2xl hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20">View Schedule ➔</a>
                            ) : (
                                <p className="text-slate-500 font-medium italic">No timetable uploaded yet.</p>
                            )}
                        </div>

                        {/* Subjects Grid */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2 flex items-center gap-3"><span className="text-3xl">📁</span> Course Repository</h2>
                            {classData.teachers.length === 0 ? (
                                <div className="bg-white/50 rounded-[32px] p-20 text-center border-2 border-dashed border-brand-300">
                                    <p className="text-slate-400">No teachers have joined this classroom yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {classData.teachers.map((teacherObj, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => {
                                                setSelectedCourse(teacherObj);
                                                setCourseTab('materials'); // default tab
                                            }}
                                            className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-500 transition-all duration-300 cursor-pointer group"
                                        >
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

                {/* ========================================= */}
                {/* VIEW 2: INSIDE A SPECIFIC COURSE FOLDER   */}
                {/* ========================================= */}
                {selectedCourse && (
                    <div className="animate-fade-in-up">
                        <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white shadow-2xl mb-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="px-3 py-1 bg-brand-500 text-slate-900 text-[10px] font-black uppercase rounded-lg tracking-widest mb-4 inline-block">Active Workspace</span>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{selectedCourse.subjectName}</h1>
                                <p className="text-brand-300 text-lg">Instructor: Prof. {selectedCourse.user?.name}</p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-500/20 to-transparent blur-[60px]"></div>
                        </div>

                        {/* TABS NAVIGATION */}
                        <div className="flex gap-4 mb-8 px-2">
                            <button onClick={() => setCourseTab('materials')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${courseTab === 'materials' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>
                                📚 Study Materials
                            </button>
                            <button onClick={() => setCourseTab('doubts')} className={`px-6 py-3 rounded-2xl font-bold transition-all ${courseTab === 'doubts' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-brand-200'}`}>
                                💬 Discussion Forum
                            </button>
                        </div>

                        {/* --- TAB 1: MATERIALS --- */}
                        {courseTab === 'materials' && (
                            <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm">
                                <div className="flex justify-between items-center mb-8 pb-4 border-b border-brand-100">
                                    <h2 className="text-2xl font-bold text-slate-800">Resource Library</h2>
                                    {user.role === 'teacher' && user._id === selectedCourse.user?._id && (
                                        <button onClick={() => setIsUploading(!isUploading)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm">
                                            {isUploading ? 'Cancel Upload' : '+ Upload Material'}
                                        </button>
                                    )}
                                </div>

                                {/* Upload Form (Visible only to the teacher of this course) */}
                                {isUploading && (
                                    <form onSubmit={handleUploadMaterial} className="bg-brand-50 p-6 rounded-2xl mb-8 border border-brand-200 flex flex-col gap-4">
                                        <input type="text" placeholder="Resource Title (e.g., Chapter 1 Notes)" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} required className="w-full px-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
                                        <input type="url" placeholder="Document Link (Google Drive, Dropbox, etc.)" value={matUrl} onChange={(e) => setMatUrl(e.target.value)} required className="w-full px-4 py-3 bg-white border border-brand-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
                                        <button type="submit" className="self-end px-8 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-all shadow-md">Save Resource</button>
                                    </form>
                                )}

                                {/* Filter Materials for this subject */}
                                {(() => {
                                    const courseMaterials = classData.materials.filter(m => m.folderSubject === selectedCourse.subjectName);
                                    if (courseMaterials.length === 0) return <p className="text-slate-400 italic text-center py-10">No materials have been uploaded for this course yet.</p>;
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {courseMaterials.map((mat, i) => (
                                                <div key={i} className="flex items-center justify-between bg-brand-50 p-4 rounded-2xl border border-brand-100 hover:border-brand-300 transition-colors">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className="text-2xl">📄</span>
                                                        <span className="font-bold text-slate-700 truncate">{mat.title}</span>
                                                    </div>
                                                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-brand-600 text-xs font-black uppercase rounded-lg border border-brand-200 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all ml-4 shrink-0">
                                                        Open
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* --- TAB 2: DOUBTS FORUM --- */}
                        {courseTab === 'doubts' && (
                            <div className="space-y-8">
                                {/* Post Doubt Form (Visible to Students) */}
                                {user.role === 'student' && (
                                    <div className="bg-white p-8 rounded-[32px] border border-brand-200 shadow-sm">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6">Ask a Question</h3>
                                        <form onSubmit={handleAskDoubt} className="flex flex-col gap-4">
                                            <input type="text" placeholder="Question Title..." value={newDoubt.title} onChange={(e) => setNewDoubt({...newDoubt, title: e.target.value})} required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500" />
                                            <textarea placeholder="Describe your doubt in detail..." value={newDoubt.description} onChange={(e) => setNewDoubt({...newDoubt, description: e.target.value})} rows="3" required className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500" />
                                            
                                            {/* NEW: Image Reference Link Input */}
                                            <input type="url" placeholder="Optional: Link to an image or screenshot reference (G-Drive, Imgur, etc.)" value={newDoubt.referenceUrl} onChange={(e) => setNewDoubt({...newDoubt, referenceUrl: e.target.value})} className="w-full px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500" />
                                            
                                            <button type="submit" disabled={isPosting} className="self-end px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md disabled:opacity-50">
                                                {isPosting ? 'Posting...' : 'Post Question'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Doubts List */}
                                <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
                                    Discussion Thread <span className="bg-brand-500 text-xs px-2 py-0.5 rounded-full">{doubts.length}</span>
                                </h3>

                                {doubts.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-12 text-center">
                                        <p className="text-slate-400 font-medium">No questions asked in this subject yet.</p>
                                    </div>
                                ) : (
                                    doubts.map((doubt) => (
                                        <div key={doubt._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-brand-200">
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-xl font-bold text-slate-800 leading-tight">{doubt.title}</h4>
                                                    <div className="px-3 py-1 bg-brand-100 text-brand-500 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0">
                                                        Question
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 mb-4">{doubt.description}</p>
                                                
                                                {/* Display Image Reference Link if it exists */}
                                                {doubt.referenceUrl && (
                                                    <a href={doubt.referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 font-bold mb-6 hover:text-slate-900">
                                                        <span>🔗</span> View Attached Reference Image
                                                    </a>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-brand-300 rounded-full flex items-center justify-center font-bold text-slate-700 text-xs">{doubt.postedBy?.name?.charAt(0)}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 leading-none">{doubt.postedBy?.name}</p>
                                                        <p className="text-[10px] text-slate-400 capitalize">{doubt.postedBy?.role}</p>
                                                    </div>
                                                </div>

                                                {/* Answers Section */}
                                                <div className="mt-8 pt-6 border-t border-brand-100">
                                                    <p className="text-sm font-bold text-slate-800 mb-4">Replies ({doubt.answers.length})</p>
                                                    <div className="space-y-4">
                                                        {doubt.answers.map((ans, index) => (
                                                            <div key={index} className="bg-brand-50 p-5 rounded-2xl relative border border-brand-100">
                                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-l-2xl"></div>
                                                                <p className="text-slate-700 text-sm mb-3">{ans.text}</p>
                                                                
                                                                {ans.referenceUrl && (
                                                                    <a href={ans.referenceUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-600 font-bold mb-3 hover:text-slate-900">
                                                                        🔗 View Answer Reference
                                                                    </a>
                                                                )}

                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— {ans.answeredBy?.name}</p>
                                                            </div>
                                                        ))}

                                                        {/* Answer Input Box */}
                                                        <form onSubmit={(e) => handleAnswerDoubt(e, doubt._id)} className="flex flex-col md:flex-row gap-3 mt-6">
                                                            <div className="flex-1 flex flex-col gap-2">
                                                                <input type="text" placeholder="Write an answer..." value={answerInputs[doubt._id]?.text || ''} onChange={(e) => handleAnswerChange(doubt._id, 'text', e.target.value)} required className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
                                                                <input type="url" placeholder="Optional: Link to solution image" value={answerInputs[doubt._id]?.referenceUrl || ''} onChange={(e) => handleAnswerChange(doubt._id, 'referenceUrl', e.target.value)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500" />
                                                            </div>
                                                            <button type="submit" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all self-start md:self-stretch mt-auto md:mt-0">
                                                                Reply
                                                            </button>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
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