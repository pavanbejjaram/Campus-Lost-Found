import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, Inbox, MessageSquare, Shield, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <span>🔍 Campus Lost & Found</span>
      </div>
      
      {user && (
        <>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Search size={18} />
              <span>Browse Feed</span>
            </NavLink>
            
            <NavLink to="/report" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={18} />
              <span>Report Item</span>
            </NavLink>
            
            <NavLink to="/listings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Inbox size={18} />
              <span>My Reports & Claims</span>
            </NavLink>
            
            <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={18} />
              <span>Messages</span>
            </NavLink>

            {user.admin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Shield size={18} />
                <span>Admin Queue</span>
              </NavLink>
            )}
          </div>

          <div className="nav-user">
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>
              Hi, <strong>{user.name}</strong> ({user.studentNumber})
            </span>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
