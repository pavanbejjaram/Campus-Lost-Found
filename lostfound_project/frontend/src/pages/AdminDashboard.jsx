import React, { useEffect, useState } from 'react';
import ItemCard from '../components/ItemCard';
import { ShieldAlert, Users, Layers, Award } from 'lucide-react';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    lostCount: 0,
    foundCount: 0,
    pendingCount: 0,
    resolvedCount: 0,
    totalClaims: 0
  });
  const [pendingItems, setPendingItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (!statsRes.ok) throw new Error('Failed to load stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const pendingRes = await fetch('/api/admin/pending');
      if (!pendingRes.ok) throw new Error('Failed to load pending items');
      const pendingData = await pendingRes.json();
      setPendingItems(pendingData);

      const studentsRes = await fetch('/api/admin/students');
      if (!studentsRes.ok) throw new Error('Failed to load students');
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

    } catch (err) {
      setError(err.message || 'Error fetching admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (itemId) => {
    try {
      const res = await fetch(`/api/admin/items/${itemId}/approve`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to approve item');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (itemId) => {
    try {
      const res = await fetch(`/api/admin/items/${itemId}/reject`, {
        method: 'PUT'
      });
      if (!res.ok) throw new Error('Failed to reject item');
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in admin-sections">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Admin Portal</h1>
          <p>Moderate new listings, view campus statistics, and manage registered students.</p>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '8px', textAlign: 'left' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading administration details...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Users size={14} style={{ marginRight: '6px' }} /> Registered Students
              </span>
              <span className="stat-value">{stats.totalStudents}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Layers size={14} style={{ marginRight: '6px' }} /> Lost Postings
              </span>
              <span className="stat-value">{stats.lostCount}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Layers size={14} style={{ marginRight: '6px' }} /> Found Postings
              </span>
              <span className="stat-value">{stats.foundCount}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ShieldAlert size={14} style={{ marginRight: '6px' }} /> Pending Approval
              </span>
              <span className="stat-value" style={{ color: 'var(--warning)', WebkitTextFillColor: 'initial' }}>{stats.pendingCount}</span>
            </div>
            <div className="glass-card stat-card">
              <span className="stat-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Award size={14} style={{ marginRight: '6px' }} /> Claims Submitted
              </span>
              <span className="stat-value">{stats.totalClaims}</span>
            </div>
          </div>

          <div>
            <h2 className="section-title">Moderation Queue ({pendingItems.length})</h2>
            {pendingItems.length === 0 ? (
              <div className="glass-card no-data">
                <p>The moderation queue is clear! No listings require review.</p>
              </div>
            ) : (
              <div className="items-grid">
                {pendingItems.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    currentUser={user}
                    isAdminMode={true}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="section-title">Registered Campus Members</h2>
            <div className="glass-card" style={{ overflowX: 'auto', padding: 0 }}>
              <table className="claims-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Phone</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td><strong>{student.studentNumber}</strong></td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.department}</td>
                      <td>{student.phone}</td>
                      <td>
                        <span className={`badge-claim-status ${student.admin ? 'claim-approved' : 'claim-pending'}`}>
                          {student.admin ? 'Admin' : 'Student'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
