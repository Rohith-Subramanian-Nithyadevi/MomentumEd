import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ClassDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    // States for Material Upload
    const [uploadingTo, setUploadingTo] = useState(null); // Tracks which folder is open for upload
    const [matTitle, setMatTitle] = useState('');
    const [matUrl, setMatUrl] = useState('');

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

    useEffect(() => {
        fetchClassDetails();
    }, [id]);

    const handleDeleteClass = async () => {
        if (window.confirm('Are you sure you want to delete this entire class? This cannot be undone.')) {
            try {
                await api.delete(`/classes/${id}`);
                navigate('/classes'); // Send them back to the classes list
            } catch (err) {
                alert('Failed to delete class');
            }
        }
    };

    const handleUploadMaterial = async (e, subjectName) => {
        e.preventDefault();
        try {
            await api.post(`/classes/${id}/materials`, {
                title: matTitle,
                fileUrl: matUrl,
                folderSubject: subjectName
            });
            setMatTitle('');
            setMatUrl('');
            setUploadingTo(null); // Close the form
            fetchClassDetails(); // Refresh to see the new material
        } catch (err) {
            alert('Failed to upload material');
        }
    };

    if (loading) return <div className="loading-state">Loading classroom...</div>;
    if (!classData) return <div className="loading-state">Class not found.</div>;

    return (
        <div className="container">
            <Link to="/classes" className="back-link">⬅ Back to All Classes</Link>
            
            {/* Header Section */}
            <div className="class-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>{classData.className}</h1>
                        <p>Class Advisor: {classData.advisor?.name}</p>
                        {user.role === 'advisor' && (
                            <p className="group-code-badge">Group Code: <strong>{classData.groupCode}</strong></p>
                        )}
                    </div>
                    {/* Delete Class Button (Advisors Only) */}
                    {user.role === 'advisor' && (
                        <button onClick={handleDeleteClass} className="btn-danger">Delete Class</button>
                    )}
                </div>
            </div>

            {/* Timetable Section */}
            <div className="card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>📅 Class Timetable</h2>
                </div>
                {classData.timetableUrl ? (
                    <a href={classData.timetableUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', marginTop: '15px' }}>View Timetable</a>
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
                    <div className="folder-grid">
                        {classData.teachers.map((teacherObj, index) => {
                            // Find materials that belong to THIS specific subject folder
                            const folderMaterials = classData.materials.filter(m => m.folderSubject === teacherObj.subjectName);

                            return (
                                <div key={index} className="folder-card">
                                    <h3 style={{ margin: '0 0 5px 0' }}>{teacherObj.subjectName}</h3>
                                    <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px' }}>Prof. {teacherObj.user?.name}</p>
                                    
                                    {/* List out the materials for this folder */}
                                    <div className="materials-list">
                                        {folderMaterials.length === 0 ? <p style={{ fontSize: '12px', color: '#888' }}>No materials yet.</p> : null}
                                        {folderMaterials.map((mat, i) => (
                                            <div key={i} className="material-item">
                                                <span>📄 {mat.title}</span>
                                                <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="link-btn">View</a>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Upload Button (Only visible to the specific Teacher of this subject) */}
                                    {user.role === 'teacher' && user._id === teacherObj.user?._id && (
                                        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                            {uploadingTo === teacherObj.subjectName ? (
                                                <form onSubmit={(e) => handleUploadMaterial(e, teacherObj.subjectName)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <input type="text" placeholder="Material Title (e.g., Unit 1 Notes)" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} required />
                                                    <input type="url" placeholder="Paste Google Drive / Link URL" value={matUrl} onChange={(e) => setMatUrl(e.target.value)} required />
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button type="submit" className="btn-success">Save</button>
                                                        <button type="button" className="btn-secondary" onClick={() => setUploadingTo(null)}>Cancel</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button onClick={() => setUploadingTo(teacherObj.subjectName)} className="btn-primary" style={{ width: '100%' }}>+ Add Material</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClassDashboard;