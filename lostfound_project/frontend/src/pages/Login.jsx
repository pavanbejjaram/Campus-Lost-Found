import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    studentNumber: '',
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const url = `/api/auth/${isLoginTab ? 'login' : 'register'}`;
    const body = isLoginTab
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLoginTab) {
        onLoginSuccess(data);
      } else {
        setSuccess('Registration successful! Please login.');
        setIsLoginTab(true);
        setFormData({
          studentNumber: '',
          name: '',
          email: '',
          password: '',
          department: 'Computer Science',
          phone: ''
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="glass-card auth-card glass-card-glow">
        <h1 className="auth-title">Campus Lost & Found</h1>
        <p className="auth-subtitle">College Student & Staff Portal</p>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button
            type="button"
            className="listings-tab"
            style={{ flex: 1, background: 'none', borderBottom: isLoginTab ? '2px solid var(--primary)' : 'none', color: isLoginTab ? 'var(--text-primary)' : 'var(--text-secondary)', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '12px', cursor: 'pointer' }}
            onClick={() => { setIsLoginTab(true); setError(''); }}
          >
            <LogIn size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Login
          </button>
          <button
            type="button"
            className="listings-tab"
            style={{ flex: 1, background: 'none', borderBottom: !isLoginTab ? '2px solid var(--primary)' : 'none', color: !isLoginTab ? 'var(--text-primary)' : 'var(--text-secondary)', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '12px', cursor: 'pointer' }}
            onClick={() => { setIsLoginTab(false); setError(''); }}
          >
            <UserPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Register
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', marginBottom: '16px', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required type="text" name="name" className="form-input" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Student ID / Employee Number</label>
                <input required type="text" name="studentNumber" className="form-input" placeholder="S1001" value={formData.studentNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" className="form-input" value={formData.department} onChange={handleChange}>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Science & Arts">Science & Arts</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input required type="text" name="phone" className="form-input" placeholder="9876543210" value={formData.phone} onChange={handleChange} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">College Email</label>
            <input required type="email" name="email" className="form-input" placeholder="student@college.edu" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input required type="password" name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLoginTab ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          {isLoginTab ? "Don't have an account? " : "Already have an account? "}
          <span className="auth-link" onClick={() => setIsLoginTab(!isLoginTab)}>
            {isLoginTab ? 'Register here' : 'Login here'}
          </span>
        </p>
      </div>
    </div>
  );
}
