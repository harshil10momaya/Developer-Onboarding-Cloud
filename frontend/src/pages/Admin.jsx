import React, { useState, useEffect } from 'react';
import { learningPathAPI, courseAPI, lectureAPI } from '../services/api';
import '../styles/Admin.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('paths');
    const [paths, setPaths] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form States
    const [pathForm, setPathForm] = useState({ title: '', dev_role: 'backend', level: 'Beginner', description: '' });
    const [courseForm, setCourseForm] = useState({ title: '', description: '', learning_path_id: '', order: 0, image_url: '' });
    const [lectureForm, setLectureForm] = useState({ title: '', description: '', content: '', youtube_id: '', duration_minutes: 0, order: 0, course_id: '' });
    
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [p, c, l] = await Promise.all([
                learningPathAPI.list(),
                courseAPI.list(),
                lectureAPI.get(1).catch(() => []) // Adjusting based on common API patterns if listing isn't available
            ]);
            setPaths(p);
            setCourses(c);
            // Since there's no "list all lectures" endpoint, we'll fetch them per course if needed or just use the management logic
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    // --- Path Management ---
    const handlePathSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await learningPathAPI.update(editingId, pathForm);
                showMessage('Learning Path updated!');
            } else {
                await learningPathAPI.create(pathForm);
                showMessage('Learning Path created!');
            }
            setPathForm({ title: '', dev_role: 'backend', level: 'Beginner', description: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { showMessage(err.message, 'error'); }
    };

    const deletePath = async (id) => {
        if (!window.confirm('Delete this learning path?')) return;
        await learningPathAPI.delete(id);
        fetchData();
    };

    // --- Course Management ---
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await courseAPI.update(editingId, courseForm);
                showMessage('Course updated!');
            } else {
                await courseAPI.create(courseForm);
                showMessage('Course created!');
            }
            setCourseForm({ title: '', description: '', learning_path_id: '', order: 0, image_url: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { showMessage(err.message, 'error'); }
    };

    const deleteCourse = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        await courseAPI.delete(id);
        fetchData();
    };

    // --- Lecture Management ---
    const handleLectureSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await lectureAPI.update(editingId, lectureForm);
                showMessage('Lecture updated!');
            } else {
                await lectureAPI.create(lectureForm);
                showMessage('Lecture created!');
            }
            setLectureForm({ title: '', description: '', content: '', youtube_id: '', duration_minutes: 0, order: 0, course_id: '' });
            setEditingId(null);
            fetchData();
        } catch (err) { showMessage(err.message, 'error'); }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Management Panel</h1>
                <p>Manage your learning ecosystem: Paths, Courses, and Lectures.</p>
            </header>

            {message.text && <div className={`admin-msg ${message.type}`}>{message.text}</div>}

            <nav className="admin-tabs">
                <button className={activeTab === 'paths' ? 'active' : ''} onClick={() => {setActiveTab('paths'); setEditingId(null);}}>Learning Paths</button>
                <button className={activeTab === 'courses' ? 'active' : ''} onClick={() => {setActiveTab('courses'); setEditingId(null);}}>Courses</button>
                <button className={activeTab === 'lectures' ? 'active' : ''} onClick={() => {setActiveTab('lectures'); setEditingId(null);}}>Lectures</button>
            </nav>

            <div className="admin-content">
                {activeTab === 'paths' && (
                    <section className="admin-section">
                        <div className="form-container">
                            <h3>{editingId ? 'Edit' : 'Create'} Learning Path</h3>
                            <form onSubmit={handlePathSubmit}>
                                <input type="text" placeholder="Title (e.g. Backend Dev)" value={pathForm.title} onChange={e => setPathForm({...pathForm, title: e.target.value})} required />
                                <select value={pathForm.dev_role} onChange={e => setPathForm({...pathForm, dev_role: e.target.value})}>
                                    <option value="frontend">Frontend</option>
                                    <option value="backend">Backend</option>
                                    <option value="fullstack">Fullstack</option>
                                    <option value="devops">DevOps</option>
                                </select>
                                <select value={pathForm.level} onChange={e => setPathForm({...pathForm, level: e.target.value})}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                                <textarea placeholder="Description" value={pathForm.description} onChange={e => setPathForm({...pathForm, description: e.target.value})} />
                                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Create'} Path</button>
                                {editingId && <button type="button" onClick={() => setEditingId(null)}>Cancel</button>}
                            </form>
                        </div>
                        <div className="list-container">
                            <h3>Existing Paths</h3>
                            {paths.map(p => (
                                <div key={p.id} className="admin-item">
                                    <div><strong>{p.title}</strong> ({p.level})</div>
                                    <div className="actions">
                                        <button onClick={() => {setEditingId(p.id); setPathForm(p);}}>Edit</button>
                                        <button className="del" onClick={() => deletePath(p.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'courses' && (
                    <section className="admin-section">
                        <div className="form-container">
                            <h3>{editingId ? 'Edit' : 'Create'} Course</h3>
                            <form onSubmit={handleCourseSubmit}>
                                <input type="text" placeholder="Course Title" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required />
                                <select value={courseForm.learning_path_id} onChange={e => setCourseForm({...courseForm, learning_path_id: e.target.value})} required>
                                    <option value="">Select Learning Path</option>
                                    {paths.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                                <input type="number" placeholder="Order" value={courseForm.order} onChange={e => setCourseForm({...courseForm, order: parseInt(e.target.value)})} />
                                <input type="text" placeholder="Image URL (optional)" value={courseForm.image_url} onChange={e => setCourseForm({...courseForm, image_url: e.target.value})} />
                                <textarea placeholder="Description" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
                                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Create'} Course</button>
                                {editingId && <button type="button" onClick={() => setEditingId(null)}>Cancel</button>}
                            </form>
                        </div>
                        <div className="list-container">
                            <h3>Existing Courses</h3>
                            {courses.map(c => (
                                <div key={c.id} className="admin-item">
                                    <div><strong>{c.title}</strong> (Path #{c.learning_path_id})</div>
                                    <div className="actions">
                                        <button onClick={() => {setEditingId(c.id); setCourseForm(c);}}>Edit</button>
                                        <button className="del" onClick={() => deleteCourse(c.id)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeTab === 'lectures' && (
                    <section className="admin-section">
                        <div className="form-container">
                            <h3>{editingId ? 'Edit' : 'Create'} Lecture</h3>
                            <form onSubmit={handleLectureSubmit}>
                                <input type="text" placeholder="Lecture Title" value={lectureForm.title} onChange={e => setLectureForm({...lectureForm, title: e.target.value})} required />
                                <select value={lectureForm.course_id} onChange={e => setLectureForm({...lectureForm, course_id: e.target.value})} required>
                                    <option value="">Select Course</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <input type="text" placeholder="YouTube Video ID (optional)" value={lectureForm.youtube_id} onChange={e => setLectureForm({...lectureForm, youtube_id: e.target.value})} />
                                <input type="number" placeholder="Duration (min)" value={lectureForm.duration_minutes} onChange={e => setLectureForm({...lectureForm, duration_minutes: parseInt(e.target.value)})} />
                                <input type="number" placeholder="Order" value={lectureForm.order} onChange={e => setLectureForm({...lectureForm, order: parseInt(e.target.value)})} />
                                <textarea placeholder="Description" value={lectureForm.description} onChange={e => setLectureForm({...lectureForm, description: e.target.value})} />
                                <textarea placeholder="Markdown Content" className="content-area" value={lectureForm.content} onChange={e => setLectureForm({...lectureForm, content: e.target.value})} />
                                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Create'} Lecture</button>
                                {editingId && <button type="button" onClick={() => setEditingId(null)}>Cancel</button>}
                            </form>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Admin;
