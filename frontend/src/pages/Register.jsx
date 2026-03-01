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
            
            {/* Main Glass Card */}
            <div className="bg-white w-full max-w-md p-10 rounded-[24px] shadow-[0_20px_40px_rgba(171,196,255,0.3)] border border-white">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">MomentumEd</h2>
                    <p className="text-slate-500 text-sm">Create your account to get started.</p>
                </div>

                {/* Error Alert Box */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5 ml-1">Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            placeholder="John Doe" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5 ml-1">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="name@example.com" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5 ml-1">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="••••••••" 
                            onChange={handleChange} 
                            required 
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-1.5 ml-1">Account Role</label>
                        <select 
                            name="role" 
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="advisor">Class Advisor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Register Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-4 py-4 bg-brand-500 hover:bg-brand-400 text-slate-900 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(171,196,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-500 font-semibold hover:text-slate-800 transition-colors">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;