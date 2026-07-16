import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import { Filter, Search } from 'lucide-react';

export default function Dashboard({ user }) {
  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Claim Modal State
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [proofDescription, setProofDescription] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');
  
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    let url = '/api/items';
    const params = [];
    if (typeFilter !== 'ALL') params.push(`type=${typeFilter}`);
    if (categoryFilter !== 'ALL') params.push(`category=${categoryFilter}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError('Could not load feed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter]);

  const handleOpenClaimModal = (item) => {
    setSelectedItemForClaim(item);
    setProofDescription('');
    setClaimSuccess('');
    setClaimError('');
  };

  const handleContactOwner = (ownerId) => {
    navigate(`/chat?contactId=${ownerId}`);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    setClaimError('');
    setClaimSuccess('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemForClaim.id,
          claimerId: user.id,
          proofDescription: proofDescription
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit claim');
      }

      setClaimSuccess('Claim submitted successfully! The founder will review your details.');
      setTimeout(() => {
        setSelectedItemForClaim(null);
      }, 2000);
    } catch (err) {
      setClaimError(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Campus Feed</h1>
          <p>Browse reported lost and found items in your campus community.</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-item">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Filter size={14} /> Filter by Type
          </label>
          <select className="form-input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Items</option>
            <option value="LOST">Lost Items</option>
            <option value="FOUND">Found Items</option>
          </select>
        </div>
        <div className="filter-item">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Search size={14} /> Filter by Category
          </label>
          <select className="form-input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Keys">Keys</option>
            <option value="Books">Books</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading campus items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card no-data" style={{ padding: '60px 20px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>No items found matching the selected filters.</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/report')}>
            Report an Item Now
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              currentUser={user}
              onClaim={handleOpenClaimModal}
              onContact={handleContactOwner}
            />
          ))}
        </div>
      )}

      {/* Claim Verification Modal */}
      <Modal
        isOpen={selectedItemForClaim !== null}
        onClose={() => setSelectedItemForClaim(null)}
        title="Claim Found Item"
      >
        {selectedItemForClaim && (
          <form onSubmit={handleSubmitClaim}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You are claiming the item: <strong>{selectedItemForClaim.title}</strong> found at <strong>{selectedItemForClaim.location}</strong>.
            </p>
            
            {claimError && <div style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '14px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{claimError}</div>}
            {claimSuccess && <div style={{ color: 'var(--success)', marginBottom: '12px', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '4px' }}>{claimSuccess}</div>}

            <div className="form-group">
              <label className="form-label">Ownership Verification Details</label>
              <textarea
                required
                className="form-input"
                rows="5"
                placeholder="Describe unique identifiers of the item (e.g. keychains, wallpaper, stickers, color combinations, contents inside the wallet/bag) to prove you are the owner."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Claim</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedItemForClaim(null)}>Cancel</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
