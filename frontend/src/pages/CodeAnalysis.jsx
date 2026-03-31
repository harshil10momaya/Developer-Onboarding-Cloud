import React, { useState, useEffect } from 'react';
import { codeAnalysisAPI, repoAPI } from '../services/api';
import '../styles/Pages.css';

const CodeAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    Promise.all([codeAnalysisAPI.list(), repoAPI.list()])
      .then(([a, r]) => { setAnalyses(a); setRepos(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async (repoId) => {
    setAnalyzing(repoId);
    try {
      const result = await codeAnalysisAPI.analyze(repoId);
      setAnalyses((prev) => {
        const existing = prev.findIndex((a) => a.repo_id === repoId);
        if (existing >= 0) { const copy = [...prev]; copy[existing] = result; return copy; }
        return [result, ...prev];
      });
      setSelectedAnalysis(result);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(null); }
  };

  const unanalyzed = repos.filter((r) => !analyses.find((a) => a.repo_id === r.id));

  const ScoreBar = ({ label, value, color }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{label}</span>
        <span style={{ color, fontSize: '13px', fontWeight: '600' }}>{value}%</span>
      </div>
      <div style={{ background: '#0f172a', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.5s' }} />
      </div>
    </div>
  );

  if (loading) return <div className="page-container"><div className="loading-message">Loading...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔍 Code Analysis</h1>
        <p>AI-powered code quality analysis using Google Gemini</p>
      </div>

      {unanalyzed.length > 0 && (
        <div className="form-card" style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 12px 0' }}>Repositories Awaiting Analysis</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {unanalyzed.map((repo) => (
              <button key={repo.id} className="action-btn" onClick={() => handleAnalyze(repo.id)} disabled={analyzing === repo.id} style={{ fontSize: '13px', padding: '8px 16px' }}>
                {analyzing === repo.id ? '🤖 Analyzing with AI...' : `Analyze ${repo.name}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedAnalysis && (
        <div className="form-card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 4px 0' }}>{selectedAnalysis.repo_name}</h2>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                {(selectedAnalysis.tech_stack || []).join(' · ')} · Analyzed: {new Date(selectedAnalysis.analyzed_at).toLocaleString()}
                <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: selectedAnalysis.analysis_method === 'gemini' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: selectedAnalysis.analysis_method === 'gemini' ? '#10b981' : '#f59e0b' }}>
                  {selectedAnalysis.analysis_method === 'gemini' ? '🤖 Gemini AI' : '📊 Heuristic'}
                </span>
              </p>
            </div>
            <button onClick={() => setSelectedAnalysis(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <ScoreBar label="Code Quality" value={selectedAnalysis.quality_score} color="#10b981" />
              <ScoreBar label="Maintainability" value={selectedAnalysis.maintainability} color="#3b82f6" />
              <ScoreBar label="Test Coverage" value={selectedAnalysis.test_coverage} color="#f59e0b" />
              <ScoreBar label="Security" value={selectedAnalysis.security_score} color="#6366f1" />
            </div>
            <div>
              <h4 style={{ color: '#f1f5f9', margin: '0 0 8px 0' }}>Issues ({selectedAnalysis.issues_count})</h4>
              {(selectedAnalysis.details?.issues || []).map((issue, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: '13px' }}>
                  <span style={{ color: '#cbd5e1' }}>{issue.type}</span>
                  <span style={{ color: issue.severity === 'high' ? '#ef4444' : issue.severity === 'medium' ? '#f59e0b' : '#64748b' }}>{issue.count} ({issue.severity})</span>
                </div>
              ))}
              <h4 style={{ color: '#f1f5f9', margin: '16px 0 8px 0' }}>Recommendations</h4>
              {(selectedAnalysis.details?.recommendations || []).map((rec, i) => (
                <p key={i} style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0', paddingLeft: '12px', borderLeft: '2px solid #334155' }}>{rec}</p>
              ))}
              {selectedAnalysis.ai_summary && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px' }}>
                  <p style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0' }}>🤖 AI Summary</p>
                  <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: '1.6' }}>{selectedAnalysis.ai_summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="analysis-table">
        <table>
          <thead><tr><th>Repository</th><th>Quality</th><th>Issues</th><th>Security</th><th>Coverage</th><th>Actions</th></tr></thead>
          <tbody>
            {analyses.map((a) => (
              <tr key={a.id} onClick={() => setSelectedAnalysis(a)} style={{ cursor: 'pointer' }}>
                <td>{a.repo_name}</td>
                <td><span className="badge success">{a.quality_score}%</span></td>
                <td><span className="badge warning">{a.issues_count}</span></td>
                <td><span className="badge success">{a.security_score}%</span></td>
                <td>{a.test_coverage}%</td>
                <td><button className="action-btn" onClick={(e) => { e.stopPropagation(); handleAnalyze(a.repo_id); }} disabled={analyzing === a.repo_id} style={{ fontSize: '12px', padding: '4px 10px' }}>{analyzing === a.repo_id ? '...' : 'Re-analyze'}</button></td>
              </tr>
            ))}
            {analyses.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>No analyses yet. Analyze a repository above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeAnalysis;
