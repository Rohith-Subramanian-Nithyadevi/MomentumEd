import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [message, setMessage] = useState('');

    // Kick out anyone who isn't an admin
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    const fetchUnverifiedUsers = async () => {
        try {
            const { data } = await api.get('/admin/unverified');
            setUnverifiedUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        fetchUnverifiedUsers();
    }, []);

    const handleVerify = async (userId) => {
        try {
            const { data } = await api.put(`/admin/verify/${userId}`);
            setMessage(data.message);
            fetchUnverifiedUsers(); // Refresh the list
            
            // Clear success message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to verify user.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'blue' }}>⬅ Back to Main Dashboard</Link>
            <h2 style={{ marginTop: '20px' }}>Admin Control Panel</h2>
            <p>Approve new Teachers and Class Advisors below.</p>

            {message && <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '15px', borderRadius: '5px' }}>{message}</div>}

            {unverifiedUsers.length === 0 ? (
                <p style={{ color: 'green', fontWeight: 'bold' }}>All users have been verified!</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {unverifiedUsers.map((u) => (
                        <div key={u._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{u.name}</strong> ({u.email})
                                <br />
                                <span style={{ color: '#666', textTransform: 'capitalize' }}>Role: {u.role}</span>
                            </div>
                            <button 
                                onClick={() => handleVerify(u._id)}
                                style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Verify Account
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;