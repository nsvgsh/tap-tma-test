"use client";

import { useState, useEffect } from 'react';
import { modalClickLogger } from '@/lib/modalClickLogger';

export default function TestModalLoggingPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [envStatus, setEnvStatus] = useState<any>(null);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    try {
      const response = await fetch('/api/v1/debug/env-check');
      const data = await response.json();
      setEnvStatus(data);
    } catch (error) {
      setEnvStatus({ error: 'Failed to check environment' });
    }
  };

  const testLogging = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      await modalClickLogger.logLevelUpModalClick(
        'test-user-123',
        'test-session-456',
        1,
        'try_for_free',
        { test: true, timestamp: Date.now() }
      );
      setResult('✅ Logging successful! Check the database.');
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkLogs = async () => {
    setLoading(true);
    setResult('Fetching logs...');
    
    try {
      const response = await fetch('/api/v1/modal/log-click?userId=test-user-123&limit=10');
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Found ${data.clicks.length} logs:\n${JSON.stringify(data.clicks, null, 2)}`);
      } else {
        setResult(`❌ Error fetching logs: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Modal Click Logging Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testLogging} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Logging'}
        </button>
        
        <button 
          onClick={checkLogs} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Check Logs'}
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {result || 'Click a button to test modal click logging...'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Environment Check:</h3>
        {envStatus ? (
          <div>
            <ul>
              <li>NEXT_PUBLIC_SUPABASE_URL: {envStatus.environment?.supabaseUrl || 'Unknown'}</li>
              <li>SUPABASE_SERVICE_ROLE_KEY: {envStatus.environment?.serviceKey || 'Unknown'}</li>
            </ul>
            <p style={{ color: envStatus.environment?.hasSupabaseUrl && envStatus.environment?.hasServiceKey ? 'green' : 'red' }}>
              <strong>{envStatus.message}</strong>
            </p>
            <button 
              onClick={checkEnvironment}
              style={{ 
                padding: '5px 10px', 
                fontSize: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Refresh Check
            </button>
          </div>
        ) : (
          <p>Loading environment check...</p>
        )}
      </div>
    </div>
  );
}
