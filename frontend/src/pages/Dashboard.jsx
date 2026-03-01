import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // UI State for tabs (Sidebar navigation)
    const [activeTab, setActiveTab] = useState('profile');

    // --- PROFILE STATES ---
    const [profileData, setProfileData] = useState({});
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

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
                setProfileData(profileRes.data);
                
                const classesRes = await api.get('/classes/my-classes');
                setMyClasses(classesRes.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchDashboardData();
    }, []);

    // --- PROFILE HANDLERS ---
    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/users/profile', profileData);
            setProfileMessage('Profile updated successfully!');
            setIsEditingProfile(false);
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (err) {
            setProfileMessage('Failed to update profile.');
        }
    };

    // --- CLASS HANDLERS ---
    const fetchMyClasses = async () => {
        const { data } = await api.get('/classes/my-classes');
        setMyClasses(data);
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/classes', { className });
            setClassName('');
            setClassMessage('Class created successfully!');
            fetchMyClasses();
            setTimeout(() => setClassMessage(''), 3000);
        } catch (err) {
            setClassMessage(err.response?.data?.message || 'Failed to create class');
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
            setClassMessage(data.message);
            fetchMyClasses();
            setTimeout(() => setClassMessage(''), 3000);
        } catch (err) {
            setClassMessage(err.response?.data?.message || 'Failed to join class');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-100 font-sans flex flex-col md:flex-row">
            
            {/* --- SIDEBAR NAVIGATION --- */}
            <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between shadow-2xl z-20 sticky top-0 md:h-screen">
                <div className="p-6">
                    <h2 className="text-2xl font-black tracking-tight mb-8 text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-slate-900">M</div>
                        MomentumEd
                    </h2>
                    
                    <nav className="flex flex-col gap-2">
                        <button onClick={() => setActiveTab('profile')} className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            👤 My Profile
                        </button>
                        <button onClick={() => setActiveTab('classes')} className={`text-left px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'classes' ? 'bg-brand-500 text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                            📚 Classrooms
                        </button>
                        {user.role === 'admin' && (
                            <Link to="/admin" className="text-left px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
                                🛡️ Admin Panel
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="p-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-brand-400">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold truncate w-32">{user.name}</p>
                            <p className="text-[10px] text-brand-400 uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-2 bg-red-500/10 text-red-400 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm">
                        Log Out
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
                
                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-900">Personal Profile</h1>
                            <p className="text-slate-500">Manage your personal information and academic details.</p>
                        </header>

                        {profileMessage && (
                            <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-100 rounded-2xl font-medium text-center shadow-sm">
                                ✅ {profileMessage}
                            </div>
                        )}

                        <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-brand-200">
                            <div className="flex justify-between items-center mb-8 border-b border-brand-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-800">Profile Details</h2>
                                <button 
                                    onClick={() => setIsEditingProfile(!isEditingProfile)} 
                                    className="px-4 py-2 bg-brand-100 text-brand-600 font-bold rounded-lg hover:bg-brand-200 transition-colors text-sm"
                                >
                                    {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                            </div>

                            <form onSubmit={handleProfileSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Form Fields mapped dynamically for cleaner code */}
                                    {[
                                        { label: 'Full Name', name: 'name', type: 'text', disabled: true }, // Usually shouldn't change name easily
                                        { label: 'Email Address', name: 'email', type: 'email', disabled: true },
                                        { label: user.role === 'student' ? 'Roll Number' : 'Faculty ID', name: 'rollNo', type: 'text' },
                                        { label: 'Date of Birth', name: 'dob', type: 'date' },
                                        { label: 'Age', name: 'age', type: 'number' },
                                        { label: 'Phone Number', name: 'phone', type: 'tel' },
                                        { label: 'Father\'s Name', name: 'fatherName', type: 'text' },
                                        { label: 'Mother\'s Name', name: 'motherName', type: 'text' }
                                    ].map((field, idx) => (
                                        <div key={idx}>
                                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{field.label}</label>
                                            <input 
                                                type={field.type} 
                                                name={field.name}
                                                value={profileData[field.name]?.split('T')[0] || ''} // Format date correctly if exists
                                                onChange={handleProfileChange}
                                                disabled={!isEditingProfile || field.disabled}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 disabled:opacity-60 transition-all"
                                            />
                                        </div>
                                    ))}
                                    
                                    {/* Gender Dropdown */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Gender</label>
                                        <select 
                                            name="gender" 
                                            value={profileData.gender || ''} 
                                            onChange={handleProfileChange}
                                            disabled={!isEditingProfile}
                                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-brand-500 disabled:opacity-60 transition-all"
                                        >
                                            <option value="">Select Gender...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {isEditingProfile && (
                                    <div className="mt-8 flex justify-end">
                                        <button type="submit" className="px-8 py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400 transition-all shadow-md">
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* --- CLASSROOMS TAB --- */}
                {activeTab === 'classes' && (
                    <div className="max-w-5xl mx-auto">
                        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900">Classrooms Hub</h1>
                                <p className="text-slate-500">Manage your courses, enrollments, and academic groups.</p>
                            </div>
                        </header>

                        {classMessage && (
                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold text-center shadow-sm border ${classMessage.includes('Failed') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                {classMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* FORMS SECTION */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* ADVISOR CREATE FORM */}
                                {user?.role === 'advisor' && (
                                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-200">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4">Create Classroom</h3>
                                        <form onSubmit={handleCreateClass} className="flex flex-col gap-3">
                                            <input 
                                                type="text" placeholder="Class Name (e.g., CS Sec A)" value={className} onChange={(e) => setClassName(e.target.value)} required 
                                                className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500"
                                            />
                                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400">
                                                {isLoading ? 'Processing...' : 'Generate Class'}
                                            </button>
                                            <p className="text-xs text-slate-400 text-center mt-2">Note: Advisors are restricted to creating 1 master class.</p>
                                        </form>
                                    </div>
                                )}

                                {/* STUDENT/TEACHER JOIN FORM */}
                                {user?.role !== 'admin' && (
                                    <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl text-white">
                                        <h3 className="text-lg font-bold mb-4">Join Classroom</h3>
                                        <form onSubmit={handleJoinClass} className="flex flex-col gap-3">
                                            <input 
                                                type="text" placeholder="6-Digit Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required 
                                                className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm placeholder-slate-500 uppercase tracking-widest focus:outline-none focus:border-brand-500"
                                            />
                                            {user?.role === 'teacher' && (
                                                <input 
                                                    type="text" placeholder="Subject you teach" value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} required 
                                                    className="w-full px-4 py-3 bg-slate-800 border-2 border-transparent rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-brand-500"
                                                />
                                            )}
                                            <button type="submit" disabled={isLoading} className="w-full py-3 bg-brand-500 text-slate-900 font-bold rounded-xl hover:bg-brand-400">
                                                {isLoading ? 'Joining...' : 'Enter Classroom'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* CLASS LIST SECTION */}
                            <div className="lg:col-span-2">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    Enrolled Classes <span className="bg-brand-300 text-[10px] px-2 py-0.5 rounded-full uppercase">{myClasses.length}</span>
                                </h3>
                                
                                {myClasses.length === 0 ? (
                                    <div className="bg-white/50 border-2 border-dashed border-brand-300 rounded-[32px] p-16 text-center">
                                        <p className="text-slate-400 font-medium">No classrooms joined yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {myClasses.map((cls) => (
                                            <Link to={`/class/${cls._id}`} key={cls._id} className="group bg-white p-6 rounded-[32px] border border-brand-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-500 transition-all block">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-500 font-bold text-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                                        {cls.className.charAt(0)}
                                                    </div>
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-brand-500 transition-colors">
                                                    {cls.className} ➔
                                                </h4>
                                                <div className="pt-4 border-t border-brand-100 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Join Code</span>
                                                    <span className="text-sm font-mono font-bold text-slate-700 bg-brand-100 px-3 py-1 rounded-lg">
                                                        {cls.groupCode}
                                                    </span>
                                                </div>
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