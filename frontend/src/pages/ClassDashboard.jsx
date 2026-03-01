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

    // States for Material Upload
    const [uploadingTo, setUploadingTo] = useState(null);
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');

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

    const handleDeleteClass = async () => {
        if (window.confirm('Are you sure you want to delete this entire class? This cannot be undone.')) {
            try {
                await api.delete(`/classes/${id}`);
                navigate('/dashboard'); // 👈 Changed from /classes to /dashboard
            } catch (err) {
                alert('Failed to delete class');
            }
        }
    };

    const handleUploadMaterial = async (e, subjectName) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${id}/materials`, {
                title: matTitle,
                fileUrl: matUrl,
                folderSubject: subjectName
            });
            setMatTitle('');
            setMatUrl('');
            setUploadingTo(null);
            fetchClassDetails();
        } catch (err) {
            alert('Failed to upload material');
        }
    };

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
                    <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-900 transition-colors">
                        <span className="text-xl">⬅</span> Back to Dashboard
                    </Link>
                    <div className="text-slate-400 text-sm font-medium">Classroom ID: {id.slice(-6)}</div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-10">
                
                {/* --- HEADER SECTION --- */}
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
                            <button 
                                onClick={handleDeleteClass} 
                                className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
                            >
                                Delete Classroom
                            </button>
                        )}
                    </div>
                    {/* Decorative Background Blob */}
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-500/20 rounded-full blur-[80px]"></div>
                </div>

                {/* --- TIMETABLE SECTION --- */}
                <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm mb-10 group hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <span className="text-3xl">📅</span> Weekly Timetable
                        </h2>
                    </div>
                    
                    {classData.timetableUrl ? (
                        <a 
                            href={classData.timetableUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-slate-900 font-bold rounded-2xl hover:bg-brand-400 transition-all shadow-lg shadow-brand-500/20"
                        >
                            View Schedule ➔
                        </a>
                    ) : (
                        <div className="bg-brand-100 p-6 rounded-2xl border-2 border-dashed border-brand-300 text-center">
                            <p className="text-slate-500 font-medium italic">No timetable has been uploaded by the advisor yet.</p>
                        </div>
                    )}
                </div>

                {/* --- SUBJECT FOLDERS --- */}
                <section>
                    <header className="mb-8 px-2">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-3">
                            <span className="text-3xl">📁</span> Course Repository
                        </h2>
                        <p className="text-slate-500 text-sm">Access lecture notes and study materials uploaded by faculty.</p>
                    </header>

                    {classData.teachers.length === 0 ? (
                        <div className="bg-white/50 rounded-[32px] p-20 text-center border-2 border-dashed border-brand-300">
                            <p className="text-slate-400">No teachers have joined this classroom yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classData.teachers.map((teacherObj, index) => {
                                const folderMaterials = classData.materials.filter(m => m.folderSubject === teacherObj.subjectName);

                                return (
                                    <div key={index} className="bg-white rounded-[32px] border border-brand-200 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 group">
                                        <div className="p-6 pb-4">
                                            <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-500 font-bold text-xl mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                {teacherObj.subjectName.charAt(0)}
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">{teacherObj.subjectName}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prof. {teacherObj.user?.name}</p>
                                        </div>

                                        {/* Materials List */}
                                        <div className="px-6 flex-1">
                                            <div className="bg-brand-100 rounded-2xl p-4 space-y-3 min-h-[100px]">
                                                {folderMaterials.length === 0 ? (
                                                    <p className="text-[11px] text-slate-400 italic text-center mt-6">Empty repository</p>
                                                ) : (
                                                    folderMaterials.map((mat, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-brand-200">
                                                            <span className="text-xs font-bold text-slate-700 truncate mr-2">📄 {mat.title}</span>
                                                            <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-brand-500 uppercase hover:text-slate-800 transition-colors">
                                                                Open
                                                            </a>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload Section (Teacher Specific) */}
                                        <div className="p-6">
                                            {user.role === 'teacher' && user._id === teacherObj.user?._id ? (
                                                <div className="pt-4 border-t border-brand-100">
                                                    {uploadingTo === teacherObj.subjectName ? (
                                                        <form onSubmit={(e) => handleUploadMaterial(e, teacherObj.subjectName)} className="flex flex-col gap-3">
                                                            <input 
                                                                type="text" 
                                                                placeholder="File Title..." 
                                                                value={matTitle} 
                                                                onChange={(e) => setMatTitle(e.target.value)} 
                                                                required 
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                                                            />
                                                            <input 
                                                                type="url" 
                                                                placeholder="Link (G-Drive/Dropbox)..." 
                                                                value={matUrl} 
                                                                onChange={(e) => setMatUrl(e.target.value)} 
                                                                required 
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-lg hover:bg-slate-800">Save</button>
                                                                <button type="button" onClick={() => setUploadingTo(null)} className="flex-1 py-2 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">Cancel</button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setUploadingTo(teacherObj.subjectName)} 
                                                            className="w-full py-3 bg-brand-500 text-slate-900 text-sm font-bold rounded-xl hover:bg-brand-400 transition-all shadow-md shadow-brand-500/10"
                                                        >
                                                            + Add New Resource
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                    Read Only Access
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ClassDashboard;