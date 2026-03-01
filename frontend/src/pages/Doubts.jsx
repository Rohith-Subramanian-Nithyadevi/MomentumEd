import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Doubts = () => {
    const { user } = useContext(AuthContext);
    const [doubts, setDoubts] = useState([]);
    
    // States for asking a new doubt
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [askError, setAskError] = useState('');

    // State for teachers answering a doubt
    const [answerInputs, setAnswerInputs] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchDoubts = async () => {
        try {
            const { data } = await api.get('/doubts');
            setDoubts(data);
        } catch (err) {
            console.error('Failed to fetch doubts', err);
        }
    };

    useEffect(() => {
        fetchDoubts();
    }, []);

    const handleAskSubmit = async (e) => {
        e.preventDefault();
        setAskError('');
        setIsLoading(true);
        try {
            await api.post('/doubts', { title, description });
            setTitle('');
            setDescription('');
            fetchDoubts();
        } catch (err) {
            setAskError(err.response?.data?.message || 'Failed to post doubt');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (doubtId, text) => {
        setAnswerInputs({ ...answerInputs, [doubtId]: text });
    };

    const handleAnswerSubmit = async (e, doubtId) => {
        e.preventDefault();
        try {
            await api.post(`/doubts/${doubtId}/answers`, { text: answerInputs[doubtId] });
            setAnswerInputs({ ...answerInputs, [doubtId]: '' });
            fetchDoubts();
        } catch (err) {
            console.error('Failed to post answer', err);
            alert('Failed to post answer. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-20">
            {/* --- TOP NAVIGATION --- */}
            <nav className="bg-white/70 backdrop-blur-md border-b border-brand-200 sticky top-0 z-10 px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-slate-800 transition-colors">
                        <span className="text-xl">⬅</span> Back to Dashboard
                    </Link>
                    <h2 className="text-xl font-bold text-slate-800">Doubt Center</h2>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-10">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Academic Discussions</h1>
                    <p className="text-slate-500">Collaborate with peers and faculty to resolve your queries.</p>
                </header>

                {/* --- ASK A DOUBT FORM (Students Only) --- */}
                {user?.role === 'student' && (
                    <div className="bg-white p-8 rounded-[32px] shadow-[0_20px_40px_rgba(171,196,255,0.2)] border border-white mb-12">
                        <h3 className="text-xl font-bold text-slate-800 mb-4 ml-1">Ask a New Doubt</h3>
                        {askError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100 italic">
                                ⚠️ {askError}
                            </div>
                        )}
                        <form onSubmit={handleAskSubmit} className="flex flex-col gap-4">
                            <input 
                                type="text" 
                                placeholder="Short title of your doubt..." 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                className="w-full px-5 py-4 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 transition-all duration-300"
                            />
                            <textarea 
                                placeholder="Describe your confusion in detail. Be specific!" 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                rows="4"
                                required 
                                className="w-full px-5 py-4 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 transition-all duration-300"
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="self-end px-8 py-4 bg-brand-500 text-slate-900 font-bold rounded-2xl hover:bg-brand-400 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-brand-500/20 disabled:opacity-50"
                            >
                                {isLoading ? 'Posting...' : 'Post Question'}
                            </button>
                        </form>
                    </div>
                )}

                {/* --- DOUBTS FEED --- */}
                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
                        Recent Feed <span className="bg-brand-500 text-xs px-2 py-0.5 rounded-full">{doubts.length}</span>
                    </h3>
                    
                    {doubts.length === 0 ? (
                        <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-12 text-center">
                            <p className="text-slate-400 font-medium">No doubts posted yet. Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        doubts.map((doubt) => (
                            <div key={doubt._id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-brand-200 hover:shadow-xl transition-all duration-500">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-2xl font-bold text-slate-800 leading-tight">{doubt.title}</h4>
                                        <div className="px-3 py-1 bg-brand-100 text-brand-500 text-xs font-bold rounded-lg uppercase tracking-wider">
                                            Question
                                        </div>
                                    </div>
                                    <p className="text-slate-600 mb-6 leading-relaxed">{doubt.description}</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-300 rounded-full flex items-center justify-center font-bold text-slate-700">
                                            {doubt.postedBy?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-none">{doubt.postedBy?.name}</p>
                                            <p className="text-xs text-slate-400 capitalize">{doubt.postedBy?.role}</p>
                                        </div>
                                    </div>

                                    {/* --- ANSWERS SECTION --- */}
                                    <div className="mt-8 pt-8 border-t border-brand-100">
                                        <p className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            Discussion Thread <span className="text-brand-500 italic">({doubt.answers.length} replies)</span>
                                        </p>
                                        
                                        <div className="space-y-4">
                                            {doubt.answers.map((ans, index) => (
                                                <div key={index} className="bg-brand-100 p-5 rounded-2xl relative">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-l-2xl"></div>
                                                    <p className="text-slate-700 text-sm mb-2">{ans.text}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— {ans.answeredBy?.name}</p>
                                                </div>
                                            ))}

                                            {/* Teacher Reply Action */}
                                            {user?.role === 'teacher' && (
                                                <form onSubmit={(e) => handleAnswerSubmit(e, doubt._id)} className="flex gap-3 mt-6">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Write an expert answer..." 
                                                        value={answerInputs[doubt._id] || ''} 
                                                        onChange={(e) => handleAnswerChange(doubt._id, e.target.value)}
                                                        required 
                                                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-colors"
                                                    />
                                                    <button type="submit" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95">
                                                        Reply
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Doubts;