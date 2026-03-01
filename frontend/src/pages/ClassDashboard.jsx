import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ClassDashboard = () => {
    const { id } = useParams(); // Gets the class ID from the URL
    const { user } = useContext(AuthContext);
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const { data } = await api.get(`/classes/${id}`);
                setClassData(data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch class details', err);
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading classroom...</div>;
    if (!classData) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Class not found.</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
            <Link to="/classes" style={{ textDecoration: 'none', color: 'blue' }}>⬅ Back to All Classes</Link>
            
            {/* Header Section */}
            <div style={{ backgroundColor: '#0056b3', color: 'white', padding: '30px', borderRadius: '8px', marginTop: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0' }}>{classData.className}</h1>
                <p style={{ margin: 0, fontSize: '18px' }}>Class Advisor: {classData.advisor?.name}</p>
                {user.role === 'advisor' && (
                    <p style={{ margin: '10px 0 0 0', backgroundColor: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '5px 10px', borderRadius: '4px' }}>
                        Group Code: <strong>{classData.groupCode}</strong>
                    </p>
                )}
            </div>

            {/* Timetable Section */}
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>📅 Class Timetable</h2>
                    {user.role === 'advisor' && (
                        <button style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Upload New Timetable (Coming Soon)
                        </button>
                    )}
                </div>
                {classData.timetableUrl ? (
                    <a href={classData.timetableUrl} target="_blank" rel="noopener noreferrer">View Timetable</a>
                ) : (
                    <p style={{ color: '#666', marginTop: '10px' }}>No timetable uploaded yet.</p>
                )}
            </div>

            {/* Subject Folders Section */}
            <div style={{ marginTop: '30px' }}>
                <h2>📁 Subject Folders & Materials</h2>
                <p style={{ color: '#666' }}>Materials are organized by the faculty handling the subject.</p>
                
                {classData.teachers.length === 0 ? (
                    <p>No teachers have joined this class yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                        {classData.teachers.map((teacherObj, index) => (
                            <div key={index} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', backgroundColor: '#fff', borderTop: '5px solid #17a2b8' }}>
                                <h3 style={{ margin: '0 0 5px 0' }}>{teacherObj.subjectName}</h3>
                                <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px' }}>Prof. {teacherObj.user?.name}</p>
                                
                                <button style={{ width: '100%', padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    View Materials
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassDashboard;