import React from 'react';
import { Calendar, MapPin, Phone, MessageSquare, ShieldCheck, Tag } from 'lucide-react';

export default function ItemCard({ item, currentUser, onClaim, onContact, showStatus = false, isAdminMode = false, onApprove, onReject }) {
  const isReporter = currentUser && item.reporter && currentUser.id === item.reporter.id;
  const backendUrl = "";

  return (
    <div className="glass-card item-card animate-fade-in">
      <div className="item-image-container">
        {item.imageUrl ? (
          <img src={`${backendUrl}${item.imageUrl}`} alt={item.title} className="item-image" />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'var(--gradient-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <Tag size={40} style={{ opacity: 0.5 }} />
          </div>
        )}
        <span className={`item-badge ${item.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
          {item.type}
        </span>
        {showStatus && (
          <span className={`badge-status status-${item.status.toLowerCase().replace('_', '')}`}>
            {item.status.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="item-details">
        <span className="item-meta">{item.category}</span>
        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">{item.description}</p>

        <div className="item-info-row">
          <MapPin size={14} />
          <span>{item.location}</span>
        </div>
        <div className="item-info-row">
          <Calendar size={14} />
          <span>{item.date}</span>
        </div>
        
        {item.status !== "PENDING_APPROVAL" && (
          <div className="item-info-row">
            <Phone size={14} />
            <span>{item.contactInfo}</span>
          </div>
        )}

        <div className="item-reporter">
          <span>By: {item.reporter ? item.reporter.name : 'System'}</span>
          {item.reporter && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.reporter.department}</span>}
        </div>

        {isAdminMode ? (
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', width: '100%' }}>
            <button className="btn btn-success item-card-btn" style={{ flex: 1 }} onClick={() => onApprove(item.id)}>Approve</button>
            <button className="btn btn-danger item-card-btn" style={{ flex: 1 }} onClick={() => onReject(item.id)}>Reject</button>
          </div>
        ) : (
          currentUser && !isReporter && item.status === 'APPROVED' && (
            item.type === 'FOUND' ? (
              <button className="btn btn-primary item-card-btn" onClick={() => onClaim(item)}>
                <ShieldCheck size={16} /> Claim / Verify
              </button>
            ) : (
              <button className="btn btn-secondary item-card-btn" onClick={() => onContact(item.reporter.id)}>
                <MessageSquare size={16} /> Contact Owner
              </button>
            )
          )
        )}
      </div>
    </div>
  );
}
