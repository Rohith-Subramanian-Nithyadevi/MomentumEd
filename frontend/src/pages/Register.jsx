import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 p-4 font-sans">
            
            {/* Main Auth Card */}
            <div className="bg-white w-full max-w-lg p-8 md:p-12 rounded-[32px] shadow-[0_20px_40px_rgba(171,196,255,0.3)] border border-white">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">Create Account</h2>
                    <p className="text-slate-500 text-sm">Join MomentumEd to start your learning journey.</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-6 text-sm text-center border border-red-100 animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            placeholder="John Doe" 
                            onChange={handleChange}
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="name@university.edu" 
                            onChange={handleChange}
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        />
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="••••••••" 
                            onChange={handleChange}
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Select Your Role</label>
                        <select 
                            name="role" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-2xl text-slate-800 text-sm appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="advisor">Class Advisor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-4 py-4 bg-brand-500 hover:bg-brand-400 text-slate-900 text-base font-bold rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Register Now'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-500 font-bold hover:text-slate-800 transition-colors ml-1">
                        Login here
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Register;