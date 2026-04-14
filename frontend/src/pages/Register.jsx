import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'developer', dev_role: 'backend' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header"><span className="auth-logo">☁️</span><h1>Create Account</h1><p>Join the Developer Onboarding Cloud</p></div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><label>Full Name</label><input type="text" name="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group"><label>Password</label><input type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Role</label><select name="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="developer">Developer</option><option value="mentor">Mentor</option></select></div>
            <div className="form-group"><label>Dev Role</label><select name="dev_role" value={form.dev_role} onChange={(e) => setForm({ ...form, dev_role: e.target.value })}><option value="frontend">Frontend</option><option value="backend">Backend</option><option value="devops">DevOps</option><option value="fullstack">Full Stack</option></select></div>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};

export default Register;
