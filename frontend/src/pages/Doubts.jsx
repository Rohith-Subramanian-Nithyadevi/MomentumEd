import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Doubts = () => {
    const { user } = useContext(AuthContext);
    const [doubts, setDoubts] = useState([]);
    
    // States for asking a new doubt
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [askError, setAskError] = useState('');

    // State for teachers answering a doubt (stores text by doubt ID)
    const [answerInputs, setAnswerInputs] = useState({});

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

    // Handle student posting a doubt
    const handleAskSubmit = async (e) => {
        e.preventDefault();
        setAskError('');
        try {
            await api.post('/doubts', { title, description });
            setTitle('');
            setDescription('');
            fetchDoubts();
        } catch (err) {
            setAskError(err.response?.data?.message || 'Failed to post doubt');
        }
    };

    // Handle teacher typing an answer
    const handleAnswerChange = (doubtId, text) => {
        setAnswerInputs({ ...answerInputs, [doubtId]: text });
    };

    // Handle teacher submitting an answer
    const handleAnswerSubmit = async (e, doubtId) => {
        e.preventDefault();
        try {
            await api.post(`/doubts/${doubtId}/answers`, { text: answerInputs[doubtId] });
            // Clear that specific input box after submitting
            setAnswerInputs({ ...answerInputs, [doubtId]: '' });
            // Refresh the doubts list so the new answer appears instantly
            fetchDoubts();
        } catch (err) {
            console.error('Failed to post answer', err);
            alert('Failed to post answer. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'blue' }}>⬅ Back to Dashboard</Link>
            <h2 style={{ marginTop: '20px' }}>Academic Doubts & Discussions</h2>

            {/* Post a Doubt Form (Students Only) */}
            {user?.role === 'student' && (
                <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Ask a New Doubt</h3>
                    {askError && <p style={{ color: 'red' }}>{askError}</p>}
                    <form onSubmit={handleAskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Doubt Title (e.g., Confused about React Hooks)" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                            style={{ padding: '10px' }}
                        />
                        <textarea 
                            placeholder="Describe your doubt in detail..." 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows="4"
                            required 
                            style={{ padding: '10px' }}
                        />
                        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}>
                            Post Doubt
                        </button>
                    </form>
                </div>
            )}

            {/* List of Doubts */}
            <h3>Recent Doubts</h3>
            {doubts.length === 0 ? (
                <p>No doubts posted yet. Be the first!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {doubts.map((doubt) => (
                        <div key={doubt._id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{doubt.title}</h4>
                            <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.5' }}>{doubt.description}</p>
                            <small style={{ color: '#888' }}>
                                Posted by: <strong>{doubt.postedBy?.name}</strong> ({doubt.postedBy?.role})
                            </small>
                            
                            {/* Existing Answers Section */}
                            <div style={{ marginTop: '20px', paddingLeft: '15px', borderLeft: '3px solid #0056b3' }}>
                                <strong>Answers ({doubt.answers.length})</strong>
                                {doubt.answers.length > 0 ? (
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {doubt.answers.map((ans, index) => (
                                            <div key={index} style={{ backgroundColor: '#f1f1f1', padding: '10px', borderRadius: '5px' }}>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{ans.text}</p>
                                                <small style={{ color: '#666' }}>- Answered by {ans.answeredBy?.name}</small>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ fontSize: '14px', color: '#777', marginTop: '10px' }}>No answers yet.</p>
                                )}

                                {/* Reply Input Box (Teachers Only) */}
                                {user?.role === 'teacher' && (
                                    <form onSubmit={(e) => handleAnswerSubmit(e, doubt._id)} style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Type your answer here..." 
                                            value={answerInputs[doubt._id] || ''} 
                                            onChange={(e) => handleAnswerChange(doubt._id, e.target.value)}
                                            required 
                                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                        />
                                        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            Reply
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Doubts;