"use client";

import { useState } from 'react';

export default function TestModalConfigPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConfig = async (level: number) => {
    setLoading(true);
    setResult(`Testing level ${level}...`);
    
    try {
      const response = await fetch(`/api/v1/modal/config?level=${level}`);
      const data = await response.json();
      
      setResult(`Level ${level} result:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error testing level ${level}: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Modal Config Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => testConfig(1)} 
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
          Test Level 1
        </button>
        
        <button 
          onClick={() => testConfig(2)} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Level 2
        </button>
        
        <button 
          onClick={() => testConfig(5)} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Level 5
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
        {result || 'Click a button to test modal config API...'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Make sure you have set <code>integration = true</code> for level 1 in your database</li>
          <li>Click &quot;Test Level 1&quot; to see if it returns custom config</li>
          <li>Check browser console for detailed logs</li>
          <li>Check server logs for API debugging info</li>
        </ol>
      </div>
    </div>
  );
}
