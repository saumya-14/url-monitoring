'use client';

import React, { useState, useEffect } from 'react';
import { getDashboard, addUrl } from '../src/lib/api';

interface DashboardItem {
  url: string;
  status: 'UP' | 'DOWN' | 'PENDING';
  statusCode: number | null;
  responseTime: number | null;
  lastChecked: string | null;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const dashboardData = await getDashboard();
      setData(dashboardData);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics. Please check if the backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    // Poll for status updates every 20 seconds
    const interval = setInterval(() => fetchData(), 20000);
    return () => clearInterval(interval);
  }, []);

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await addUrl(newUrl.trim());
      setNewUrl('');
      setSubmitSuccess(true);
      fetchData(); // Trigger immediate reload
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || err.message || 'Failed to register URL.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalUrls = data.length;
  const upUrls = data.filter((item) => item.status === 'UP').length;
  const downUrls = data.filter((item) => item.status === 'DOWN').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-zinc-900/70 border-b border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">UptimeMonitor</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-zinc-400">
              Last updated: {mounted ? lastRefreshed.toLocaleTimeString() : '--:--:--'}
            </span>
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh Statuses"
            >
              <svg 
                className={`h-4.5 w-4.5 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8" aria-label="Monitoring Statistics">
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-xl shadow-black/5 hover:border-zinc-700/60 transition-all">
            <p className="text-sm font-medium text-zinc-400 mb-1">Total Monitored</p>
            <p className="text-3xl font-bold text-white">{loading ? '...' : totalUrls}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-xl shadow-black/5 hover:border-zinc-700/60 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Operational</p>
            <p className="text-3xl font-bold text-emerald-400">{loading ? '...' : upUrls}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 shadow-xl shadow-black/5 hover:border-zinc-700/60 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all"></div>
            <p className="text-sm font-medium text-zinc-400 mb-1">Outages</p>
            <p className="text-3xl font-bold text-rose-400">{loading ? '...' : downUrls}</p>
          </div>
        </section>

        {/* Add URL Form */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 mb-8 shadow-xl shadow-black/5" aria-label="Add URL Form">
          <h2 className="text-base font-semibold text-white mb-4">Monitor a New Website</h2>
          <form onSubmit={handleAddUrl} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={submitting}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newUrl.trim()}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Registering...
                </>
              ) : (
                'Add URL'
              )}
            </button>
          </form>

          {/* Form Feedback */}
          {submitSuccess && (
            <p className="mt-2.5 text-sm text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              ✓ URL added to monitoring successfully.
            </p>
          )}
          {submitError && (
            <p className="mt-2.5 text-sm text-rose-400 flex items-center gap-1.5 animate-fadeIn">
              ⚠ {submitError}
            </p>
          )}
        </section>

        {/* Dashboard Metrics Table */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl shadow-black/5" aria-label="Website Status Grid">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Monitored Web Services</h2>
            {totalUrls > 0 && (
              <span className="text-xs font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                {totalUrls} Target(s)
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-zinc-400 font-medium">Fetching active statuses...</p>
            </div>
          ) : error ? (
            <div className="py-16 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Failed to Connect</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-4">{error}</p>
              <button
                onClick={() => fetchData(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 font-medium text-zinc-200 transition-all hover:text-white cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : totalUrls === 0 ? (
            <div className="py-20 text-center">
              <div className="h-12 w-12 rounded-full bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No URLs Registered</h3>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Add your first website using the input form above to begin live monitoring.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-950/20">
                    <th className="py-3.5 px-5">URL</th>
                    <th className="py-3.5 px-5 text-center">Status</th>
                    <th className="py-3.5 px-5 text-center">Status Code</th>
                    <th className="py-3.5 px-5 text-right">Response Time</th>
                    <th className="py-3.5 px-5 text-right">Last Checked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/10 transition-all">
                      <td className="py-4 px-5 max-w-xs sm:max-w-md truncate font-medium">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-200 hover:text-indigo-400 hover:underline transition-all"
                        >
                          {item.url}
                        </a>
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {item.status === 'UP' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🟢 UP
                          </span>
                        ) : item.status === 'DOWN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                            🔴 DOWN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            🟡 PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap text-sm text-zinc-300 font-mono">
                        {item.statusCode !== null ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            item.statusCode >= 200 && item.statusCode < 300 
                              ? 'bg-emerald-500/5 text-emerald-400' 
                              : 'bg-rose-500/5 text-rose-400'
                          }`}>
                            {item.statusCode}
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-sans">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap text-sm font-mono text-zinc-300">
                        {item.responseTime !== null ? (
                          <span>{item.responseTime} ms</span>
                        ) : (
                          <span className="text-zinc-500 font-sans">-</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap text-xs text-zinc-400">
                        {item.lastChecked ? (
                          new Date(item.lastChecked).toLocaleString()
                        ) : (
                          <span className="text-zinc-500 italic">Waiting for first check...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 mt-auto bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} UptimeMonitor. All checks conducted at 1-minute intervals.
          </p>
        </div>
      </footer>
    </div>
  );
}
