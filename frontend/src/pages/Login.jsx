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
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            
            {/* Aesthetic Background Shapes using your palette */}
            <div className="bg-shape" style={{ top: '-10%', left: '-5%', width: '400px', height: '400px', backgroundColor: 'var(--color-3)' }}></div>
            <div className="bg-shape" style={{ bottom: '-10%', right: '-5%', width: '500px', height: '500px', backgroundColor: 'var(--color-2)' }}></div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '50px 40px', margin: '20px', zIndex: 1 }}>
                
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ color: 'var(--text-main)', margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                        MomentumEd
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', border: '1px solid #fca5a5' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginLeft: '4px' }}>
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            className="modern-input"
                            placeholder="name@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', marginLeft: '4px' }}>
                            Password
                        </label>
                        <input 
                            type="password" 
                            className="modern-input"
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button type="submit" className="modern-button" style={{ marginTop: '10px' }} disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', marginLeft: '5px' }}>
                        Register here
                    </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Login;