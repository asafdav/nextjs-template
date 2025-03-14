'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Log page load
    console.log('Debug page loaded at:', new Date().toISOString());
    
    // Test API connection
    const testApi = async () => {
      try {
        console.log('Testing API connection...');
        // For static export, try to fetch the JSON file directly
        const response = await fetch('/api/debug/data.json');
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', errorText);
          setApiStatus('error');
          setApiResponse(`Status: ${response.status}, Error: ${errorText}`);
          return;
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        setApiStatus('success');
        setApiResponse(data);
      } catch (err) {
        console.error('API fetch error:', err);
        setApiStatus('error');
        setApiResponse(err instanceof Error ? err.message : String(err));
      }
    };

    // Get client-side environment variables
    const getEnvVars = () => {
      const vars: Record<string, string> = {};
      
      // Next.js public environment variables
      Object.keys(window).forEach(key => {
        if (key.startsWith('__NEXT_DATA__')) {
          try {
            const nextData = (window as any)[key];
            if (nextData && nextData.props && nextData.props.pageProps && nextData.props.pageProps.ENV) {
              Object.assign(vars, nextData.props.pageProps.ENV);
            }
          } catch (e) {
            console.error('Error parsing Next.js data:', e);
          }
        }
      });
      
      // Add any environment variables exposed to the client
      if (typeof window !== 'undefined') {
        if (process.env.NEXT_PUBLIC_ENVIRONMENT) {
          vars['NEXT_PUBLIC_ENVIRONMENT'] = process.env.NEXT_PUBLIC_ENVIRONMENT;
        }
      }
      
      setEnvVars(vars);
    };

    const init = async () => {
      try {
        setLoading(true);
        getEnvVars();
        await testApi();
      } catch (err) {
        console.error('Debug initialization error:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Application Debug Page</h1>
        
        {loading ? (
          <div className="animate-pulse p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            Loading diagnostic information...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Environment Information</h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(envVars, null, 2) || "No environment variables found"}
                </pre>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">API Status</h2>
              <div className={`p-4 rounded-md ${
                apiStatus === 'success' 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : apiStatus === 'error'
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                <p className="font-semibold mb-2">Status: {apiStatus}</p>
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'No response data'}
                </pre>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Browser Information</h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>Hostname:</strong> {window.location.hostname}</p>
                <p><strong>Pathname:</strong> {window.location.pathname}</p>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
} 