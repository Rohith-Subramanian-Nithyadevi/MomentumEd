import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 p-4 font-sans">
            
            {/* The Main Glass/White Card */}
            <div className="bg-white w-full max-w-md p-10 rounded-[24px] shadow-[0_20px_40px_rgba(171,196,255,0.3)] border border-white">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">MomentumEd</h2>
                    <p className="text-slate-500 text-sm">Welcome back! Please enter your details.</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2 ml-1">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full px-4 py-3.5 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        />
                    </div>
                    
                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2 ml-1">
                            Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full px-4 py-3.5 bg-brand-100 border-2 border-transparent rounded-xl text-slate-800 text-sm placeholder-slate-400 transition-all duration-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
                        />
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full mt-2 py-4 bg-brand-500 hover:bg-brand-400 text-slate-900 text-base font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(171,196,255,0.4)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-brand-500 font-semibold hover:text-slate-800 transition-colors">
                        Register here
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Login;