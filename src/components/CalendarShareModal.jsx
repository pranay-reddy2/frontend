import { useState, useEffect } from 'react';
import { calendarsAPI } from '../api/calendars';
import './CalendarShareModal.css';

function CalendarShareModal({ calendar, onClose }) {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShares();
  }, [calendar.id]);

  const loadShares = async () => {
    try {
      const data = await calendarsAPI.getShares(calendar.id);
      setShares(data);
    } catch (err) {
      console.error('Failed to load shares:', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await calendarsAPI.share(calendar.id, { userEmail: email, permission });
      setEmail('');
      setPermission('view');
      await loadShares();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (userId) => {
    if (!confirm('Remove this user\'s access?')) return;

    try {
      await calendarsAPI.removeShare(calendar.id, userId);
      await loadShares();
    } catch (err) {
      alert('Failed to remove share');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share "{calendar.name}"</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <form className="share-form" onSubmit={handleShare}>
            <div className="form-row">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
              >
                <option value="view">View</option>
                <option value="edit">Edit</option>
                <option value="manage">Manage</option>
              </select>

              <button type="submit" disabled={loading}>
                {loading ? 'Sharing...' : 'Share'}
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}
          </form>

          <div className="shares-list">
            <h3>People with access</h3>

            {shares.length === 0 ? (
              <p className="no-shares">No one else has access to this calendar</p>
            ) : (
              shares.map(share => (
                <div key={share.id} className="share-item">
                  <div className="share-info">
                    <div className="share-name">{share.name}</div>
                    <div className="share-email">{share.email}</div>
                  </div>

                  <div className="share-actions">
                    <span className="share-permission">
                      {share.permission}
                    </span>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveShare(share.user_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarShareModal;
