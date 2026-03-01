import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Classes = () => {
    const { user } = useContext(AuthContext);
    const [myClasses, setMyClasses] = useState([]);
    
    // State for creating a class (Advisor)
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    
    // State for joining a class (Everyone)
    const [joinCode, setJoinCode] = useState('');
    const [teacherSubject, setTeacherSubject] = useState(''); // Stores the Teacher's subject folder name
    const [message, setMessage] = useState('');

    const fetchMyClasses = async () => {
        try {
            const { data } = await api.get('/classes/my-classes');
            setMyClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes', err);
        }
    };

    useEffect(() => {
        fetchMyClasses();
    }, []);

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await api.post('/classes', { className, subject });
            setClassName('');
            setSubject('');
            setMessage('Class created successfully!');
            fetchMyClasses();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to create class');
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        try {
            // Send both the code and the subject (if they are a teacher)
            const { data } = await api.post('/classes/join', { 
                groupCode: joinCode, 
                teacherSubject: user.role === 'teacher' ? teacherSubject : undefined 
            });
            setJoinCode('');
            setTeacherSubject(''); // Clear it
            setMessage(data.message);
            fetchMyClasses();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to join class');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'blue' }}>⬅ Back to Dashboard</Link>
            <h2 style={{ marginTop: '20px' }}>My Classrooms</h2>

            {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '15px', borderRadius: '5px' }}>{message}</div>}

            {/* CREATE CLASS FORM (Advisors Only) */}
            {user?.role === 'advisor' && (
                <div style={{ border: '1px solid #0056b3', padding: '20px', marginBottom: '30px', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
                    <h3>Create a New Class</h3>
                    <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <input type="text" placeholder="Class Name (e.g., CS Section A)" value={className} onChange={(e) => setClassName(e.target.value)} required style={{ flex: 1, padding: '10px' }} />
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Generate Class</button>
                    </form>
                </div>
            )}

            {/* JOIN CLASS FORM (Available to Students, Teachers, and Advisors) */}
            {user?.role !== 'admin' && (
                <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '30px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3>Join a Class</h3>
                    <form onSubmit={handleJoinClass} style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <input 
                            type="text" 
                            placeholder="Enter 6-Digit Group Code" 
                            value={joinCode} 
                            onChange={(e) => setJoinCode(e.target.value)} 
                            required 
                            style={{ flex: 1, minWidth: '200px', padding: '10px', textTransform: 'uppercase' }} 
                        />
                        
                        {/* 👇 ONLY SHOW THIS INPUT TO TEACHERS 👇 */}
                        {user?.role === 'teacher' && (
                            <input 
                                type="text" 
                                placeholder="Subject you teach (e.g., Physics)" 
                                value={teacherSubject} 
                                onChange={(e) => setTeacherSubject(e.target.value)} 
                                required 
                                style={{ flex: 1, minWidth: '200px', padding: '10px' }} 
                            />
                        )}

                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Join</button>
                    </form>
                </div>
            )}

            {/* LIST OF ENROLLED CLASSES */}
            <h3>Classes I am in</h3>
            {myClasses.length === 0 ? (
                <p style={{ color: '#666' }}>You haven't joined any classes yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    {myClasses.map((cls) => (
                        <div key={cls._id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #0056b3' }}>
                            {/* The Clickable Link to enter the classroom */}
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '22px' }}>
                                <Link to={`/class/${cls._id}`} style={{ textDecoration: 'none', color: '#0056b3' }}>
                                    {cls.className} ➔
                                </Link>
                            </h4>
                            <p style={{ margin: '0 0 10px 0', color: '#555' }}>Course: {cls.subject}</p>
                            <p style={{ margin: '0', fontSize: '14px', backgroundColor: '#eee', display: 'inline-block', padding: '5px 10px', borderRadius: '4px' }}>
                                Group Code: <strong style={{ letterSpacing: '2px' }}>{cls.groupCode}</strong>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Classes;