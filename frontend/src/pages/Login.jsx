import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    
    // Added a loading state so the button changes while connecting to backend
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '20px' }}>
            {/* The main login card */}
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px 30px' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: 'var(--primary)', margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700' }}>
                        MomentumEd
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Error Alert Box */}
                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={{ padding: '12px' }}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                            Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            style={{ padding: '12px' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '16px' }} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Section */}
                <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                        Register here
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Login;