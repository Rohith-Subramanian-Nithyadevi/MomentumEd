import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Doubts = () => {
    const { user } = useContext(AuthContext);
    const [doubts, setDoubts] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    // Fetch all doubts when the page loads
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

    // Handle posting a new doubt
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/doubts', { title, description });
            setTitle(''); // Clear form
            setDescription('');
            fetchDoubts(); // Refresh the list automatically
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post doubt');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <Link to="/dashboard">⬅ Back to Dashboard</Link>
            <h2>Academic Doubts & Discussions</h2>

            {/* Post a Doubt Form (Only show for students, or both if you prefer) */}
            {user?.role === 'student' && (
                <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', borderRadius: '5px' }}>
                    <h3>Ask a New Doubt</h3>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Doubt Title (e.g., Confused about React Hooks)" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                        <textarea 
                            placeholder="Describe your doubt in detail..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4"
                            required 
                        />
                        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Post Doubt</button>
                    </form>
                </div>
            )}

            {/* List of Doubts */}
            <h3>Recent Doubts</h3>
            {doubts.length === 0 ? (
                <p>No doubts posted yet. Be the first!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {doubts.map((doubt) => (
                        <div key={doubt._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>{doubt.title}</h4>
                            <p style={{ margin: '0 0 10px 0' }}>{doubt.description}</p>
                            <small style={{ color: '#666' }}>
                                Posted by: <strong>{doubt.postedBy?.name}</strong> ({doubt.postedBy?.role})
                            </small>
                            
                            {/* Answers Section */}
                            <div style={{ marginTop: '15px', paddingLeft: '15px', borderLeft: '3px solid #eee' }}>
                                <strong>Answers: {doubt.answers.length}</strong>
                                {doubt.answers.map((ans, index) => (
                                    <p key={index} style={{ margin: '5px 0', fontSize: '14px' }}>
                                        ↳ {ans.text} <small>- {ans.answeredBy?.name}</small>
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Doubts;