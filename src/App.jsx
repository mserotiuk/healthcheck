import React, { useState, useEffect } from 'react';

    function App() {
      const [urls, setUrls] = useState(() => {
        const savedUrls = localStorage.getItem('healthcheckUrls');
        return savedUrls ? JSON.parse(savedUrls) : [];
      });
      const [newUrl, setNewUrl] = useState('');
      const [healthChecks, setHealthChecks] = useState({});
      const [loading, setLoading] = useState({});
      const [proxyError, setProxyError] = useState(null);

      const handleAddUrl = () => {
        if (newUrl.trim() !== '') {
          setUrls([...urls, newUrl]);
          setNewUrl('');
        }
      };

      const handleCheckHealth = async (url) => {
        setLoading((prev) => ({ ...prev, [url]: true }));
        try {
          const startTime = Date.now();
          const response = await fetch(`/api/${url}`);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const responseData = await response.text();

          setHealthChecks((prev) => ({
            ...prev,
            [url]: {
              status: response.ok ? 'healthy' : 'unhealthy',
              statusCode: response.status,
              statusText: response.statusText,
              responseTime: responseTime,
              fullUrl: response.url,
              error: null,
              responseData: responseData
            },
          }));
          setProxyError(null);
        } catch (error) {
           setHealthChecks((prev) => ({
            ...prev,
            [url]: {
              status: 'unhealthy',
              statusCode: 'N/A',
              statusText: 'N/A',
              responseTime: 'N/A',
              fullUrl: url,
              error: error.message,
              responseData: null
            },
          }));
          if (error.message.includes('Failed to fetch')) {
            setProxyError('CORS error. Unable to fetch data from the provided URL.');
          } else {
            setProxyError(null);
          }
        } finally {
          setLoading((prev) => ({ ...prev, [url]: false }));
        }
      };

      useEffect(() => {
        localStorage.setItem('healthcheckUrls', JSON.stringify(urls));
        urls.forEach((url) => {
          handleCheckHealth(url);
        });
      }, [urls]);

      const handleRefresh = (url) => {
        handleCheckHealth(url);
      };

      const handleRemove = (url) => {
        setUrls(urls.filter((u) => u !== url));
      };

      const stripUrl = (url) => {
        return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      };

      return (
        <div className="dashboard">
          <h1>Healthcheck Dashboard</h1>
          <div className="input-form">
            <input
              type="text"
              placeholder="Enter URL"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <button onClick={handleAddUrl}>Add URL</button>
          </div>
          {proxyError && <p style={{ color: 'red' }}>{proxyError}</p>}
          <div className="healthcheck-list">
            {urls.map((url) => (
              <div key={url} className="healthcheck-item">
                <span>{stripUrl(url)}</span>
                {loading[url] ? (
                  <span>Loading...</span>
                ) : (
                  <div className="healthcheck-details">
                    <span>Full URL: {healthChecks[url]?.fullUrl}</span>
                    <br />
                    <span>Status Code: {healthChecks[url]?.statusCode}</span>
                     <br />
                    <span>Status Text: {healthChecks[url]?.statusText}</span>
                    <br />
                    <span>Response Time: {healthChecks[url]?.responseTime}ms</span>
                    <br />
                    {healthChecks[url]?.error && (
                      <span>Error: {healthChecks[url]?.error}</span>
                    )}
                    {healthChecks[url]?.responseData && (
                      <details>
                        <summary>Response Data</summary>
                        <pre>{healthChecks[url]?.responseData}</pre>
                      </details>
                    )}
                  </div>
                )}
                <span
                  className="status-indicator"
                  style={{
                    backgroundColor:
                      healthChecks[url]?.status === 'healthy' ? '#4caf50' : '#f44336',
                  }}
                ></span>
                <button onClick={() => handleRefresh(url)}>Refresh</button>
                <button onClick={() => handleRemove(url)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    export default App;
