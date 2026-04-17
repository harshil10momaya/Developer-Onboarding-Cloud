import React, { useState, useEffect } from 'react';
import { repoAPI, codeAnalysisAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

const Repositories = () => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '', tech_stack: '' });
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(null);
  
  // Code Explorer State
  const [explorerRepo, setExplorerRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('.');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);

  const canAdd = user?.role === 'mentor' || user?.role === 'admin';
  const canDelete = user?.role === 'mentor' || user?.role === 'admin';

  useEffect(() => { repoAPI.list().then(setRepos).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => { e.preventDefault(); setError(''); try { const r = await repoAPI.create({ ...form, tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) }); setRepos([...repos, r]); setShowForm(false); setForm({ name: '', url: '', description: '', tech_stack: '' }); } catch (err) { setError(err.message); } };
  const handleDelete = async (id) => { if (!confirm('Delete repository?')) return; await repoAPI.delete(id); setRepos(repos.filter((r) => r.id !== id)); };
  const handleAnalyze = async (id) => { setAnalyzing(id); try { await codeAnalysisAPI.analyze(id); setRepos(repos.map((r) => r.id === id ? { ...r, is_analyzed: true } : r)); } catch (err) { console.error(err); } finally { setAnalyzing(null); } };

  const openExplorer = async (repo) => {
    setExplorerRepo(repo);
    setCurrentPath('.');
    setSelectedFile(null);
    setFileContent('');
    fetchFiles(repo.id, '.');
  };

  const fetchFiles = async (repoId, path) => {
    setLoadingFiles(true);
    try {
      const data = await repoAPI.listFiles(repoId, path);
      setFiles(data);
      setCurrentPath(path);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileClick = async (file) => {
    if (file.type === 'directory') {
      fetchFiles(explorerRepo.id, file.path);
    } else {
      setSelectedFile(file);
      try {
        const data = await repoAPI.getFileContent(explorerRepo.id, file.path);
        setFileContent(data.content);
      } catch (err) {
        setFileContent(`Error loading file: ${err.message}`);
      }
    }
  };

  if (loading) return <div className="page-container"><div className="loading-message">Loading repositories...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Repositories</h1>
        <p>Manage and analyze your codebase resources.</p>
        {canAdd && <button className="action-btn" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Repository'}</button>}
      </div>

      {showForm && (
        <div className="form-card">
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Department/Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="url" placeholder="Git URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
            <input type="text" placeholder="Short Project Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input type="text" placeholder="Tech Stack (e.g. React, Python, AWS)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            <button type="submit" className="action-btn">Add Resource</button>
          </form>
        </div>
      )}

      <div className="analysis-table">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Stack</th>
              <th>Verification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong><br />
                  <span style={{ color: '#8b949e', fontSize: '12px' }}>{r.description}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {(r.tech_stack || []).map(s => <span key={s} className="badge">{s}</span>)}
                  </div>
                </td>
                <td>
                  {r.is_analyzed ? <span className="status active">Verified</span> : <span className="status draft">Pending</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="manage-btn" onClick={() => openExplorer(r)}>Explorer</button>
                    {!r.is_analyzed && <button className="action-btn" onClick={() => handleAnalyze(r.id)} disabled={analyzing === r.id} style={{ fontSize: '12px', padding: '6px 12px' }}>{analyzing === r.id ? '...' : 'Verify'}</button>}
                    {canDelete && <button className="delete-btn" onClick={() => handleDelete(r.id)} style={{ color: '#f85149' }}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {explorerRepo && (
        <div className="modal-overlay" onClick={() => setExplorerRepo(null)}>
          <div className="modal-content code-explorer-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Code Explorer: {explorerRepo.name}</h2>
              <button className="modal-close" onClick={() => setExplorerRepo(null)}>&times;</button>
            </div>
            
            <div className="breadcrumb-bar">
              <span className="breadcrumb-item" onClick={() => fetchFiles(explorerRepo.id, '.')}>root</span>
              {currentPath !== '.' && currentPath.split('/').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-item" onClick={() => fetchFiles(explorerRepo.id, arr.slice(0, i+1).join('/'))}>{part}</span>
                </React.Fragment>
              ))}
            </div>

            <div className="code-explorer-layout">
              <div className="file-tree">
                {loadingFiles ? <p style={{ color: '#8b949e', padding: '10px' }}>Loading files...</p> : (
                  <>
                    {currentPath !== '.' && (
                       <div className="file-item" onClick={() => fetchFiles(explorerRepo.id, currentPath.includes('/') ? currentPath.split('/').slice(0, -1).join('/') : '.')}>
                        <span>..</span>
                       </div>
                    )}
                    {files.map(f => (
                      <div key={f.path} className={`file-item ${selectedFile?.path === f.path ? 'active' : ''}`} onClick={() => handleFileClick(f)}>
                        <span>{f.type === 'directory' ? 'DIR' : 'FILE'}</span>
                        <span>{f.name}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="code-view-area">
                {selectedFile ? (
                  <pre><code>{fileContent || 'Loading...'}</code></pre>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#484f58' }}>
                    Select a file to view content
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repositories;
