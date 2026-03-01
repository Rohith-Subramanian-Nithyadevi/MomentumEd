import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    // Helper to render Action Cards for better UI consistency
    const ActionCard = ({ to, title, description, iconColor = "bg-brand-300" }) => (
        <Link to={to} className="group bg-white p-6 rounded-[24px] shadow-sm border border-brand-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-brand-400">
            <div className={`w-12 h-12 ${iconColor} rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110`}>
                <span className="text-slate-800 text-xl">➔</span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">{title}</h4>
            <p className="text-sm text-slate-500">{description}</p>
        </Link>
    );

    return (
        <div className="min-h-screen bg-brand-100 font-sans pb-12">
            {/* --- TOP NAVIGATION BAR --- */}
            <nav className="bg-white/70 backdrop-blur-md border-b border-brand-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">MomentumEd</h2>
                    <button 
                        onClick={logout} 
                        className="px-5 py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-10">
                {/* --- WELCOME HEADER --- */}
                <header className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
                        Welcome back, <span className="text-brand-500">{user.name}</span>! 👋
                    </h1>
                    <div className="inline-flex items-center px-3 py-1 bg-brand-200 text-slate-700 rounded-lg text-sm font-medium capitalize">
                        Role: {user.role}
                    </div>
                </header>

                {/* --- ACTIONS GRID --- */}
                <section>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 px-1">Your Quick Actions</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* --- STUDENT VIEW --- */}
                        {user.role === 'student' && (
                            <>
                                <ActionCard 
                                    to="/doubts" 
                                    title="Ask a Doubt" 
                                    description="Get help with your academic questions from faculty." 
                                />
                                <ActionCard 
                                    to="/classes" 
                                    title="My Classrooms" 
                                    description="Join classes using codes and access study materials." 
                                />
                            </>
                        )}

                        {/* --- TEACHER VIEW --- */}
                        {user.role === 'teacher' && (
                            <>
                                <ActionCard 
                                    to="/doubts" 
                                    title="Doubt Forum" 
                                    description="Review and answer pending questions from your students." 
                                    iconColor="bg-brand-400"
                                />
                                <ActionCard 
                                    to="/classes" 
                                    title="Manage Classes" 
                                    description="Organize your subject folders and upload materials." 
                                    iconColor="bg-brand-400"
                                />
                            </>
                        )}

                        {/* --- ADVISOR VIEW --- */}
                        {user.role === 'advisor' && (
                            <>
                                <ActionCard 
                                    to="/doubts" 
                                    title="Doubt Center" 
                                    description="Manage discussions across all your handled subjects." 
                                />
                                <ActionCard 
                                    to="/classes" 
                                    title="Class Control" 
                                    description="Create classes, generate codes, and oversee folders." 
                                />
                                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200 opacity-60">
                                    <div className="w-12 h-12 bg-slate-200 rounded-2xl mb-4 flex items-center justify-center">
                                        <span className="text-slate-400">⏳</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-400 mb-1">Timetable</h4>
                                    <p className="text-sm text-slate-400">File upload functionality coming soon.</p>
                                </div>
                            </>
                        )}

                        {/* --- ADMIN VIEW --- */}
                        {user.role === 'admin' && (
                            <Link to="/admin" className="col-span-full bg-slate-900 p-8 rounded-[32px] text-white flex flex-col md:flex-row justify-between items-center group transition-all hover:bg-slate-800 shadow-2xl">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">System Administrator Panel</h3>
                                    <p className="text-slate-400">Verify new faculty accounts and manage system-wide settings.</p>
                                </div>
                                <div className="mt-6 md:mt-0 px-8 py-4 bg-brand-500 text-slate-900 font-bold rounded-2xl group-hover:scale-105 transition-transform">
                                    Open Admin Panel
                                </div>
                            </Link>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;