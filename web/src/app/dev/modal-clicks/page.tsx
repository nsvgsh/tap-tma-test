"use client";

import { useState, useEffect } from 'react';

interface ModalClick {
  id: string;
  user_id: string;
  session_id: string;
  level: number;
  click_type: string;
  modal_type: string;
  click_timestamp: string;
  user_agent: string;
  ip_address: string;
  additional_data: Record<string, unknown>;
  created_at: string;
}

export default function ModalClicksPage() {
  const [clicks, setClicks] = useState<ModalClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    userId: '',
    sessionId: '',
    level: '',
    clickType: ''
  });

  const fetchClicks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      if (filters.level) params.append('level', filters.level);
      if (filters.clickType) params.append('clickType', filters.clickType);
      params.append('limit', '50');

      const response = await fetch(`/api/v1/admin/modal-clicks?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setClicks(data.clicks || []);
      } else {
        setError(data.error || 'Failed to fetch clicks');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching clicks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClicks();
  }, [filters]);

  const testLogClick = async () => {
    try {
      const response = await fetch('/api/v1/modal/log-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-123',
          sessionId: 'test-session-456',
          level: 1,
          clickType: 'try_for_free',
          modalType: 'level_up',
          additionalData: { 
            test: true, 
            timestamp: new Date().toISOString(),
            rewards: { coins: 100, tickets: 5 },
            config: { rewardsLayout: 'gift-center', actionsLayout: 'wide-green' }
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('TRY FOR FREE click logged successfully!');
        fetchClicks();
      } else {
        alert('Failed to log TRY FOR FREE click: ' + data.error);
      }
    } catch (err) {
      alert('Error logging TRY FOR FREE click: ' + err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>TRY FOR FREE Button Clicks Logging</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This page tracks only clicks on the &quot;TRY FOR FREE&quot; button in level 1 modals.
      </p>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Test TRY FOR FREE Click Logging</h2>
        <button 
          onClick={testLogClick}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Log TRY FOR FREE Click
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Filters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({...filters, userId: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Session ID"
            value={filters.sessionId}
            onChange={(e) => setFilters({...filters, sessionId: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="number"
            placeholder="Level"
            value={filters.level}
            onChange={(e) => setFilters({...filters, level: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <select
            value={filters.clickType}
            onChange={(e) => setFilters({...filters, clickType: e.target.value})}
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">All TRY FOR FREE Clicks</option>
            <option value="try_for_free">Try For Free</option>
          </select>
        </div>
        <button 
          onClick={fetchClicks}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>TRY FOR FREE Button Clicks ({clicks.length})</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        {!loading && !error && clicks.length === 0 && (
          <p>No TRY FOR FREE clicks found. Try logging a test click above.</p>
        )}

        {!loading && !error && clicks.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ccc' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>User ID</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Session ID</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Level</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Click Type</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Modal Type</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Timestamp</th>
                  <th style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'left' }}>Additional Data</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((click) => (
                  <tr key={click.id}>
                    <td style={{ padding: '8px', border: '1px solid #ccc', fontSize: '12px' }}>
                      {click.id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', fontSize: '12px' }}>
                      {click.user_id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', fontSize: '12px' }}>
                      {click.session_id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>
                      {click.level}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        backgroundColor: click.click_type === 'try_for_free' ? '#28a745' : 
                                       click.click_type === 'claim' ? '#007bff' :
                                       click.click_type === 'bonus' ? '#ffc107' :
                                       click.click_type === 'close' ? '#dc3545' : '#6c757d',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {click.click_type}
                      </span>
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                      {click.modal_type}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', fontSize: '12px' }}>
                      {new Date(click.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ccc', fontSize: '12px' }}>
                      <pre style={{ margin: 0, fontSize: '10px', maxWidth: '200px', overflow: 'hidden' }}>
                        {JSON.stringify(click.additional_data, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
