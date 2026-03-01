import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Classes = () => {
    const { user } = useContext(AuthContext);
    const [myClasses, setMyClasses] = useState([]);
    
    // State for creating a class (Advisor)
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    
    // State for joining a class (Everyone)
    const [joinCode, setJoinCode] = useState('');
    const [teacherSubject, setTeacherSubject] = useState(''); 
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchMyClasses = async () => {
        try {
            const { data } = await api.get('/classes/my-classes');
            setMyClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes', err);
        }
    };

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/classes', { className, subject });
            setClassName('');
            setSubject('');
            setMessage('Class created successfully!');
            fetchMyClasses();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create class');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await api.post('/classes/join', { 
                groupCode: joinCode, 
                teacherSubject: user.role === 'teacher' ? teacherSubject : undefined 
            });
            setJoinCode('');
            setTeacherSubject('');
            setMessage(data.message);
            fetchMyClasses();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to join class');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-20">
            {/* --- TOP NAVIGATION --- */}
            <nav className="bg-white/70 backdrop-blur-md border-b border-brand-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-colors">
                        <span className="text-xl">⬅</span> Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold text-slate-800">Class Management</h2>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 pt-10">
                
                {/* Status Message Toast */}
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl text-sm font-medium text-center shadow-lg border animate-bounce ${message.includes('Failed') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- LEFT COLUMN: FORMS --- */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* CREATE CLASS FORM (Advisors Only) */}
                        {user?.role === 'advisor' && (
                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Create Classroom</h3>
                                <form onSubmit={handleCreateClass} className="flex flex-col gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Class Name (e.g., CS Section A)" 
                                        value={className} 
                                        onChange={(e) => setClassName(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 transition-all"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-all active:scale-95 shadow-md shadow-brand-500/20"
                                    >
                                        {isLoading ? 'Creating...' : 'Generate Class'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* JOIN CLASS FORM */}
                        {user?.role !== 'admin' && (
                            <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                                <h3 className="text-lg font-bold mb-4">Join New Class</h3>
                                <form onSubmit={handleJoinClass} className="flex flex-col gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="6-Digit Group Code" 
                                        value={joinCode} 
                                        onChange={(e) => setJoinCode(e.target.value)} 
                                        required 
                                        className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm placeholder-slate-500 uppercase tracking-widest focus:outline-none focus:border-brand-500 transition-all"
                                    />
                                    
                                    {user?.role === 'teacher' && (
                                        <input 
                                            type="text" 
                                            placeholder="Subject you handle" 
                                            value={teacherSubject} 
                                            onChange={(e) => setTeacherSubject(e.target.value)} 
                                            required 
                                            className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                                        />
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-all active:scale-95"
                                    >
                                        {isLoading ? 'Joining...' : 'Enter Classroom'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: CLASS LIST --- */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            My Active Classrooms <span className="bg-brand-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">{myClasses.length}</span>
                        </h3>
                        
                        {myClasses.length === 0 ? (
                            <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-16 text-center">
                                <p className="text-slate-400 font-medium italic">You haven't joined any classrooms yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myClasses.map((cls) => (
                                    <div key={cls._id} className="group bg-white p-6 rounded-[32px] border border-brand-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-500 font-bold">
                                                {cls.className.charAt(0)}
                                            </div>
                                            <div className="px-3 py-1 bg-brand-100 text-brand-600 text-[10px] font-bold rounded-lg tracking-widest uppercase">
                                                Active
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-brand-500 transition-colors">
                                            <Link to={`/class/${cls._id}`} className="flex items-center gap-2">
                                                {cls.className} <span>➔</span>
                                            </Link>
                                        </h4>
                                        <p className="text-xs text-slate-400 mb-6 italic">Branch: {cls.subject || "Not Specified"}</p>
                                        
                                        <div className="pt-4 border-t border-brand-100 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</span>
                                            <span className="text-sm font-mono font-bold text-slate-700 tracking-widest bg-brand-100 px-3 py-1 rounded-lg">
                                                {cls.groupCode}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Classes;