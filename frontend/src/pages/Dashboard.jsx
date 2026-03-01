import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // UI State for tabs - NOW DEFAULTS TO 'feed'
    const [activeTab, setActiveTab] = useState('feed');

    // --- MODAL STATES ---
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // --- PROFILE & SECURITY STATES ---
    const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // --- CLASS STATES ---
    const [myClasses, setMyClasses] = useState([]);
    const [className, setClassName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [teacherSubject, setTeacherSubject] = useState('');
    const [classMessage, setClassMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const profileRes = await api.get('/users/profile');
                setProfileData({
                    ...profileRes.data,
                    name: profileRes.data.name || user?.name || '',
                    email: profileRes.data.email || user?.email || '',
                    dob: profileRes.data.dob ? profileRes.data.dob.split('T')[0] : '' 
                });
                
                if (user?.role !== 'admin') {
                    const classesRes = await api.get('/classes/my-classes');
                    setMyClasses(classesRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        if (user) fetchDashboardData();
    }, [user]);

    // --- PROFILE & SECURITY HANDLERS ---
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...profileData };
            if (!payload.dob) delete payload.dob;
            if (!payload.age) delete payload.age;

            await api.put('/users/profile', payload);
            setProfileMessage('Profile updated successfully!');
            setIsEditingProfile(false);
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (err) { setProfileMessage(err.response?.data?.message || 'Failed to update profile.'); }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setPasswordMessage('New passwords do not match!');
        }
        try {
            await api.put('/users/change-password', { 
                currentPassword: passwordData.currentPassword, 
                newPassword: passwordData.newPassword 
            });
            setPasswordMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (err) { setPasswordMessage(err.response?.data?.message || 'Failed to change password.'); }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete('/users/delete-account');
            logout(); // Log them out immediately after deletion
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete account');
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    // --- CLASS HANDLERS ---
    const fetchMyClasses = async () => {
        const { data } = await api.get('/classes/my-classes');
        setMyClasses(data);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            await api.post('/classes', { className });
            setClassName(''); setClassMessage('Class created successfully!');
            fetchMyClasses(); setTimeout(() => setClassMessage(''), 3000);
        } catch (err) { setClassMessage(err.response?.data?.message || 'Failed to create class'); } 
        finally { setIsLoading(false); }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            const { data } = await api.post('/classes/join', { 
                groupCode: joinCode, teacherSubject: user?.role === 'teacher' ? teacherSubject : undefined 
            });
            setJoinCode(''); setTeacherSubject(''); setClassMessage(data.message);
            fetchMyClasses(); setTimeout(() => setClassMessage(''), 3000);
        } catch (err) { setClassMessage(err.response?.data?.message || 'Failed to join class'); } 
        finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-brand-100 font-sans flex flex-col md:flex-row relative">
            
            {/* --- CUSTOM MODALS --- */}
            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
                    <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-brand-200 text-center">
                        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">👋</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to leave?</h3>
                        <p className="text-slate-500 mb-8 text-sm">Are you sure you want to log out of your account?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={logout} className="flex-1 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-colors">Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in-up">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-red-200 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
                        <h3 className="text-2xl font-bold text-red-600 mb-2">Delete Account?</h3>
                        <p className="text-slate-500 mb-6 text-sm">This action is permanent and cannot be undone. All your personal data and enrollment history will be wiped.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50">
                                {isDeleting ? 'Deleting...' : 'Yes, Delete It'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shadow-2xl z-20 sticky top-0 md:h-screen">
                <div className="p-6">
                    <h2 className="text-2xl font-black tracking-tight mb-8 text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-slate-900">M</div>
                        MomentumEd
                    </h2>
                    
                    <nav className="flex flex-col gap-2">
                        {user?.role !== 'admin' && (
                            <button onClick={() => setActiveTab('feed')} className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'feed' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                🏠 Activity Feed
                            </button>
                        )}
                        <button onClick={() => setActiveTab('profile')} className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            👤 My Profile
                        </button>
                        {user?.role !== 'admin' && (
                            <button onClick={() => setActiveTab('classes')} className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'classes' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                📚 Classrooms
                            </button>
                        )}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-left px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                                🛡️ Admin Panel
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-brand-400 uppercase">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-sm font-bold truncate w-32">{user?.name}</p>
                            <p className="text-[10px] text-brand-400 uppercase tracking-widest">{user?.role}</p>
                        </div>
                    </div>
                    {/* TRIGGER LOGOUT MODAL */}
                    <button onClick={() => setShowLogoutModal(true)} className="w-full py-2 bg-red-500/10 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm">
                        Log Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
                
                {/* --- TAB 1: ACTIVITY FEED (Default) --- */}
                {activeTab === 'feed' && (
                    <div className="max-w-4xl mx-auto animate-fade-in-up">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
                            <p className="text-slate-500">Here is your recent academic feed and updates.</p>
                        </header>

                        {myClasses.length === 0 ? (
                            <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-16 text-center mt-10">
                                <span className="text-4xl block mb-4">📭</span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Your Feed is Empty</h3>
                                <p className="text-slate-500 mb-6">Join a classroom to start seeing announcements, materials, and assignments here.</p>
                                <button onClick={() => setActiveTab('classes')} className="px-6 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-colors">
                                    Go to Classrooms
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Announcement Skeleton - Will populate deeply in Phase 3 */}
                                <div className="bg-white rounded-[32px] p-8 border border-brand-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-brand-500"></div>
                                    <h3 className="text-xs font-black text-brand-500 uppercase tracking-widest mb-4">Latest System Updates</h3>
                                    <p className="text-slate-600 font-medium">No recent global announcements. Check your individual classes for specific assignments and materials!</p>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mt-10 px-2">Quick Access to Your Courses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {myClasses.map((cls) => (
                                        <Link to={`/class/${cls._id}`} key={cls._id} className="bg-white p-6 rounded-2xl border border-brand-100 hover:border-brand-500 hover:shadow-lg transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center font-bold text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                    {cls.className.charAt(0)}
                                                </div>
                                                <h4 className="font-bold text-slate-800">{cls.className}</h4>
                                            </div>
                                            <span className="text-brand-400 group-hover:text-brand-600">➔</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB 2: PROFILE & SECURITY --- */}
                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto animate-fade-in-up">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900">Personal Profile</h1>
                            <p className="text-slate-500">Manage your personal information and security settings.</p>
                        </header>

                        {profileMessage && (
                            <div className={`mb-6 p-4 rounded-2xl font-medium text-center shadow-sm border ${profileMessage.includes('Failed') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                {profileMessage.includes('Failed') ? '⚠️' : '✅'} {profileMessage}
                            </div>
                        )}

                        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-brand-200 mb-10">
                            <div className="flex justify-between items-center mb-8 border-b border-brand-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-800">Profile Details</h2>
                                <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="px-4 py-2 bg-brand-100 text-brand-600 font-bold rounded-lg hover:bg-brand-200 transition-colors text-sm">
                                    {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>

                            <form onSubmit={handleProfileSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label><input type="text" name="name" value={profileData.name || ''} disabled className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm opacity-60 cursor-not-allowed" /></div>
                                    <div><label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label><input type="email" name="email" value={profileData.email || ''} disabled className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm opacity-60 cursor-not-allowed" /></div>

                                    {[
                                        { label: user?.role === 'student' ? 'Roll Number' : 'Faculty ID', name: 'rollNo', type: 'text' },
                                        { label: 'Date of Birth', name: 'dob', type: 'date' },
                                        { label: 'Age', name: 'age', type: 'number' },
                                        { label: 'Phone Number', name: 'phone', type: 'tel' },
                                        { label: 'Father\'s Name', name: 'fatherName', type: 'text' },
                                        { label: 'Mother\'s Name', name: 'motherName', type: 'text' }
                                    ].map((field, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{field.label}</label>
                                            <input type={field.type} name={field.name} value={profileData[field.name] || ''} onChange={handleProfileChange} disabled={!isEditingProfile} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 disabled:opacity-60 transition-all" />
                                        </div>
                                    ))}
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Gender</label>
                                        <select name="gender" value={profileData.gender || ''} onChange={handleProfileChange} disabled={!isEditingProfile} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 disabled:opacity-60 transition-all">
                                            <option value="">Select Gender...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                {isEditingProfile && (
                                    <div className="mt-8 flex justify-end">
                                        <button type="submit" className="px-8 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-all shadow-md">Save Changes</button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* SECURITY & DANGER ZONE */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-brand-200">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-brand-100 flex items-center gap-2"><span>🔒</span> Security Settings</h2>
                                
                                {passwordMessage && (
                                    <div className={`mb-4 p-3 rounded-xl text-xs font-bold ${passwordMessage.includes('successfully') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {passwordMessage}
                                    </div>
                                )}

                                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                                    <input type="password" name="currentPassword" placeholder="Current Password" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500" />
                                    <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500" />
                                    <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-brand-500" />
                                    <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 mt-2">Update Password</button>
                                </form>
                            </div>

                            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-red-100">
                                <h2 className="text-xl font-bold text-red-600 mb-6 pb-4 border-b border-red-50 flex items-center gap-2"><span>⚠️</span> Danger Zone</h2>
                                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                    Once you delete your account, there is no going back. All of your uploaded materials, doubts, and profile details will be permanently erased.
                                </p>
                                <button onClick={() => setShowDeleteModal(true)} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-100">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB 3: CLASSROOMS --- */}
                {/* ... (Keeps your exact working Classrooms code here from earlier!) ... */}
                {activeTab === 'classes' && (
                    <div className="max-w-5xl mx-auto animate-fade-in-up">
                        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div><h1 className="text-3xl font-extrabold text-slate-900">Classrooms Hub</h1><p className="text-slate-500">Manage your courses, enrollments, and academic groups.</p></div>
                        </header>
                        {classMessage && ( <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center shadow-sm border ${classMessage.includes('Failed') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{classMessage}</div>)}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                {user?.role === 'advisor' && (
                                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-200">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Create Classroom</h3>
                                        <form onSubmit={handleCreateClass} className="flex flex-col gap-3">
                                            <input type="text" placeholder="Class Name (e.g., CS Sec A)" value={className} onChange={(e) => setClassName(e.target.value)} required className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500" />
                                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400">
                                                {isLoading ? 'Processing...' : 'Generate Class'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                                {user?.role !== 'admin' && (
                                    <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                                        <h3 className="text-lg font-bold mb-4">Join Classroom</h3>
                                        <form onSubmit={handleJoinClass} className="flex flex-col gap-3">
                                            <input type="text" placeholder="6-Digit Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm uppercase tracking-widest focus:border-brand-500" />
                                            {user?.role === 'teacher' && (
                                                <input type="text" placeholder="Subject you teach" value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} required className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm focus:border-brand-500" />
                                            )}
                                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400">
                                                {isLoading ? 'Joining...' : 'Enter Classroom'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-2">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">Enrolled Classes <span className="bg-brand-300 text-[10px] px-2 py-0.5 rounded-full uppercase">{myClasses.length}</span></h3>
                                {myClasses.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-16 text-center"><p className="text-slate-400 font-medium">No classrooms joined yet.</p></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myClasses.map((cls) => (
                                            <Link to={`/class/${cls._id}`} key={cls._id} className="group bg-white p-6 rounded-[32px] border border-brand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-500 transition-all block">
                                                <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-500 font-bold text-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">{cls.className.charAt(0)}</div></div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-brand-500 transition-colors">{cls.className} ➔</h4>
                                                <div className="pt-4 border-t border-brand-100 flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Code</span><span className="text-sm font-mono font-bold text-slate-700 bg-brand-100 px-3 py-1 rounded-lg">{cls.groupCode}</span></div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;