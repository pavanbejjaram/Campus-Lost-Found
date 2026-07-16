import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { Check, X, FileText, Send, Inbox, MessageSquare } from 'lucide-react';

export default function MyListings({ user }) {
  const [activeTab, setActiveTab] = useState('REPORTS'); // REPORTS, RECEIVED_CLAIMS, SENT_CLAIMS
  const [myItems, setMyItems] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [sentClaims, setSentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. My Items
      const itemsRes = await fetch(`/api/items/my/${user.id}`);
      if (!itemsRes.ok) throw new Error('Failed to load your reports');
      const itemsData = await itemsRes.json();
      setMyItems(itemsData);

      // 2. Received Claims
      const recRes = await fetch(`/api/claims/received/${user.id}`);
      if (!recRes.ok) throw new Error('Failed to load received claims');
      const recData = await recRes.json();
      setReceivedClaims(recData);

      // 3. Sent Claims
      const sentRes = await fetch(`/api/claims/my/${user.id}`);
      if (!sentRes.ok) throw new Error('Failed to load sent claims');
      const sentData = await sentRes.json();
      setSentClaims(sentData);

    } catch (err) {
      setError(err.message || 'Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleActionClaim = async (claimId, status) => {
    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update claim status');
      }
      
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartChat = (claimerId, itemId) => {
    navigate(`/chat?contactId=${claimerId}&itemId=${itemId}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>My Reports & Claims</h1>
          <p>Track your reported items and verify claims from other students.</p>
        </div>
      </div>

      <div className="listings-tabs">
        <div className={`listings-tab ${activeTab === 'REPORTS' ? 'active' : ''}`} onClick={() => setActiveTab('REPORTS')}>
          <FileText size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> My Listings ({myItems.length})
        </div>
        <div className={`listings-tab ${activeTab === 'RECEIVED_CLAIMS' ? 'active' : ''}`} onClick={() => setActiveTab('RECEIVED_CLAIMS')}>
          <Inbox size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Claims Received ({receivedClaims.length})
        </div>
        <div className={`listings-tab ${activeTab === 'SENT_CLAIMS' ? 'active' : ''}`} onClick={() => setActiveTab('SENT_CLAIMS')}>
          <Send size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Claims Sent ({sentClaims.length})
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading details...</p>
        </div>
      ) : (
        <>
          {activeTab === 'REPORTS' && (
            myItems.length === 0 ? (
              <div className="glass-card no-data">
                <p>You haven't reported any lost or found items yet.</p>
              </div>
            ) : (
              <div className="items-grid">
                {myItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currentUser={user}
                    showStatus={true}
                  />
                ))}
              </div>
            )
          )}

          {activeTab === 'RECEIVED_CLAIMS' && (
            receivedClaims.length === 0 ? (
              <div className="glass-card no-data">
                <p>No claims received yet. They will appear here when students claim your reported found items.</p>
              </div>
            ) : (
              <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
                <table className="claims-table">
                  <thead>
                    <tr>
                      <th>Found Item</th>
                      <th>Claimer</th>
                      <th>Verification Proof</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivedClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td>
                          <strong>{claim.item.title}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Location: {claim.item.location}</div>
                        </td>
                        <td>
                          <strong>{claim.claimer.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{claim.claimer.studentNumber} • {claim.claimer.department}</div>
                        </td>
                        <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>{claim.proofDescription}</td>
                        <td>
                          <span className={`badge-claim-status claim-${claim.status.toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>
                          {claim.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-success" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => handleActionClaim(claim.id, 'APPROVED')} title="Approve Claim">
                                <Check size={16} /> Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => handleActionClaim(claim.id, 'REJECTED')} title="Reject Claim">
                                <X size={16} /> Reject
                              </button>
                            </div>
                          ) : claim.status === 'APPROVED' ? (
                            <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => handleStartChat(claim.claimer.id, claim.item.id)}>
                              <MessageSquare size={16} /> Chat
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'SENT_CLAIMS' && (
            sentClaims.length === 0 ? (
              <div className="glass-card no-data">
                <p>You haven't submitted any claims for items.</p>
              </div>
            ) : (
              <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
                <table className="claims-table">
                  <thead>
                    <tr>
                      <th>Found Item</th>
                      <th>Reporter</th>
                      <th>My Proof Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td>
                          <strong>{claim.item.title}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Found at: {claim.item.location}</div>
                        </td>
                        <td>
                          <strong>{claim.item.reporter ? claim.item.reporter.name : 'System'}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{claim.item.reporter ? claim.item.reporter.department : ''}</div>
                        </td>
                        <td style={{ maxWidth: '350px', wordBreak: 'break-word' }}>{claim.proofDescription}</td>
                        <td>
                          <span className={`badge-claim-status claim-${claim.status.toLowerCase()}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>
                          {claim.status === 'APPROVED' ? (
                            <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '13px' }} onClick={() => handleStartChat(claim.item.reporter.id, claim.item.id)}>
                              <MessageSquare size={16} /> Chat
                            </button>
                          ) : claim.status === 'PENDING' ? (
                            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Under Review</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
