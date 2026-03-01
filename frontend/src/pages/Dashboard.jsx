import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Welcome, {user.name}</h1>
            <p>Role: <strong>{user.role}</strong></p>
            <button onClick={logout}>Logout</button>

            <div style={{ marginTop: '20px' }}>
                {user.role === 'student' ? (
                    <div>
                        <h3>Student Actions</h3>
                        <ul>
                            <li><Link to="/doubts">Ask a Doubt</Link></li>
                            <li>View Schedule</li>
                        </ul>
                    </div>
                ) : (
                    <div>
                        <h3>Teacher Actions</h3>
                        <ul>
                            <li>Upload Materials</li>
                            <li><Link to="/doubts">View and Answer Doubts</Link></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;