import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertTriangle } from 'lucide-react';

export default function ReportItem({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    type: 'LOST',
    location: '',
    date: new Date().toISOString().split('T')[0],
    contactInfo: ''
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('type', formData.type);
    data.append('location', formData.location);
    data.append('date', formData.date);
    data.append('contactInfo', formData.contactInfo);
    data.append('reporterId', user.id);
    if (file) {
      data.append('image', file);
    }

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        body: data
      });
      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Failed to submit report');
      }

      setSuccess(
        user.admin
          ? 'Item reported and automatically approved!'
          : 'Item reported successfully! It is now pending admin approval before it goes public.'
      );
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>Report Lost / Found Item</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Please enter detailed and accurate information. This helps the campus community return items quicker.
      </p>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', marginBottom: '16px', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '4px', textAlign: 'left' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Report Type</label>
            <select name="type" className="form-input" value={formData.type} onChange={handleChange}>
              <option value="LOST">I Lost Something</option>
              <option value="FOUND">I Found Something</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
              <option value="Electronics">Electronics</option>
              <option value="Documents">Documents</option>
              <option value="Keys">Keys</option>
              <option value="Books">Books</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Item Title</label>
          <input required type="text" name="title" className="form-input" placeholder="e.g. Blue Dell Laptop, Keys with red tag" value={formData.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Details</label>
          <textarea required name="description" className="form-input" rows="4" placeholder="Describe the item's appearance, brand, unique markings..." value={formData.description} onChange={handleChange} style={{ resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{formData.type === 'LOST' ? 'Last Seen Location' : 'Found Location'}</label>
            <input required type="text" name="location" className="form-input" placeholder="e.g. Canteen, Library 1st floor" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{formData.type === 'LOST' ? 'Date Lost' : 'Date Found'}</label>
            <input required type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contact Information</label>
          <input required type="text" name="contactInfo" className="form-input" placeholder="e.g. Call me at 9876543210, Email me" value={formData.contactInfo} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label className="form-label">Item Image (Optional)</label>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '4px' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Upload size={32} style={{ color: 'var(--text-muted)' }} />
                <span>Click or drag image file here to upload</span>
              </div>
            )}
          </div>
        </div>

        {!user.admin && (
          <div style={{
            display: 'flex',
            gap: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            fontSize: '13px',
            color: 'var(--warning)',
            textAlign: 'left'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>Note: Your listing will need to be approved by an administrator before it is visible on the Campus Feed.</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Submitting Report...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
