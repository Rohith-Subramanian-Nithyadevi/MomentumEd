import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Kick out anyone who isn't an admin
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    const fetchUnverifiedUsers = async () => {
        try {
            const { data } = await api.get('/admin/unverified');
            setUnverifiedUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        fetchUnverifiedUsers();
    }, []);

    const handleVerify = async (userId) => {
        setIsLoading(true);
        try {
            const { data } = await api.put(`/admin/verify/${userId}`);
            setMessage(data.message);
            fetchUnverifiedUsers(); 
            
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            setMessage('Failed to verify user.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-20">
            {/* --- TOP NAVIGATION --- */}
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 px-6 py-4 shadow-xl">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link to="/dashboard" className="text-brand-500 font-bold flex items-center gap-2 hover:text-white transition-colors">
                        <span className="text-xl">⬅</span> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <h2 className="text-white font-bold tracking-tight">Admin Terminal</h2>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 pt-12">
                {/* --- HEADER --- */}
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Verification Queue</h1>
                    <p className="text-slate-500">Approve pending Faculty and Advisor accounts to grant them system access.</p>
                </header>

                {/* --- NOTIFICATION TOAST --- */}
                {message && (
                    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                        <div className={`px-8 py-4 rounded-2xl font-bold shadow-2xl border ${message.includes('Failed') ? 'bg-red-500 text-white border-red-400' : 'bg-green-500 text-white border-green-400'}`}>
                            {message}
                        </div>
                    </div>
                )}

                {/* --- USERS LIST --- */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-1">
                        Pending Requests ({unverifiedUsers.length})
                    </h3>

                    {unverifiedUsers.length === 0 ? (
                        <div className="bg-white/60 border-2 border-dashed border-brand-300 rounded-[40px] p-20 text-center">
                            <div className="w-20 h-20 bg-brand-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Queue is Clear</h4>
                            <p className="text-slate-500 text-sm">All Teachers and Advisors have been verified!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {unverifiedUsers.map((u) => (
                                <div key={u._id} className="group bg-white p-6 rounded-[32px] border border-brand-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 hover:shadow-xl hover:border-brand-500">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-500 font-black text-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-bold text-slate-800">{u.name}</h4>
                                                <span className="px-2 py-0.5 bg-brand-200 text-brand-600 text-[10px] font-black uppercase rounded-md">
                                                    {u.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium">{u.email}</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleVerify(u._id)}
                                        disabled={isLoading}
                                        className="w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-green-500 transition-all duration-300 active:scale-95 disabled:opacity-50"
                                    >
                                        Approve Account
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;