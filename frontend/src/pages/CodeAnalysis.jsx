import React, { useState, useEffect } from 'react';
import { codeAnalysisAPI, repoAPI } from '../services/api';
import '../styles/Pages.css';

const CodeAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    Promise.all([codeAnalysisAPI.list(), repoAPI.list()])
      .then(([analysisData, repoData]) => {
        setAnalyses(analysisData);
        setRepos(repoData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async (repoId) => {
    setAnalyzing(repoId);
    try {
      const result = await codeAnalysisAPI.analyze(repoId);
      const existing = analyses.find((a) => a.repo_id === repoId);
      if (existing) {
        setAnalyses(analyses.map((a) => (a.repo_id === repoId ? result : a)));
      } else {
        setAnalyses([...analyses, result]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(null);
    }
  };

  const unanalyzedRepos = repos.filter(
    (r) => !analyses.find((a) => a.repo_id === r.id)
  );

  if (loading) return <div className="page-container"><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔍 Code Analysis</h1>
        <p>Analyze and optimize your code quality</p>
      </div>

      {/* Unanalyzed repos */}
      {unanalyzedRepos.length > 0 && (
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 12px 0' }}>Repositories Awaiting Analysis</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {unanalyzedRepos.map((repo) => (
              <button
                key={repo.id}
                className="action-btn"
                onClick={() => handleAnalyze(repo.id)}
                disabled={analyzing === repo.id}
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                {analyzing === repo.id ? 'Analyzing...' : `Analyze ${repo.name}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis results */}
      <div className="analysis-table">
        <table>
          <thead>
            <tr>
              <th>Repository</th>
              <th>Issues Found</th>
              <th>Code Quality</th>
              <th>Last Analyzed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr key={analysis.repo_id}>
                <td>{analysis.repo_name}</td>
                <td><span className="badge warning">{analysis.issues}</span></td>
                <td><span className="badge success">{analysis.quality}</span></td>
                <td>{analysis.last_analyzed}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => handleAnalyze(analysis.repo_id)}
                    disabled={analyzing === analysis.repo_id}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    {analyzing === analysis.repo_id ? '...' : 'Re-analyze'}
                  </button>
                </td>
              </tr>
            ))}
            {analyses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                  No analyses yet. Analyze a repository above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CodeAnalysis;
