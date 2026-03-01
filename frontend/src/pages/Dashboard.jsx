import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <div>
                    <h1>Welcome, {user.name}</h1>
                    <p style={{ textTransform: 'capitalize', color: '#666' }}>Role: <strong>{user.role}</strong></p>
                </div>
                <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ marginTop: '30px' }}>
                {/* --- STUDENT VIEW --- */}
                {user.role === 'student' && (
                    <div>
                        <h3>Student Actions</h3>
                        <ul>
                            <li><Link to="/doubts">Ask a Doubt</Link></li>
                            <li><Link to="/classes">My Classrooms & Join Codes</Link></li>
                        </ul>
                    </div>
                )}

                {/* --- TEACHER VIEW --- */}
                {user.role === 'teacher' && (
                    <div>
                        <h3>Teacher Actions</h3>
                        <ul>
                            <li><Link to="/doubts">View and Answer Doubts</Link></li>
                            <li style={{ color: '#999' }}>Upload Materials (Coming Soon)</li>
                        </ul>
                    </div>
                )}

                {/* --- ADVISOR VIEW --- */}
                {user.role === 'advisor' && (
                    <div>
                        <h3>Class Advisor Actions</h3>
                        <ul>
                            <li><Link to="/doubts">View and Answer Doubts</Link></li>
                            <li><Link to="/classes">Manage Classrooms</Link></li>
                            <li style={{ color: '#999' }}>Upload Timetable (Coming Soon)</li>
                        </ul>
                    </div>
                )}

                {/* --- ADMIN VIEW --- */}
                {user.role === 'admin' && (
                    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>Admin Actions</h3>
                        <p>You have full system access.</p>
                        <ul>
                            <li><strong><Link to="/admin" style={{ color: '#d32f2f' }}>Access Admin Verification Panel</Link></strong></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;