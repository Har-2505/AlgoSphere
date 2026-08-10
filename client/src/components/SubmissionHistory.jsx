import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Award, CheckCircle2, XCircle, Clock, Database, Code, FileCode, ChevronRight, CornerDownRight } from 'lucide-react';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);
        setSubmissions(response.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch submission history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': 
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'wrong': 
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'pending': 
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default: 
        return 'bg-zinc-900 text-zinc-400 border-zinc-800';
    }
  };

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileExtension = (lang) => {
    switch ((lang || '').toLowerCase()) {
      case 'cpp': return 'cpp';
      case 'java': return 'java';
      case 'javascript': return 'js';
      default: return 'txt';
    }
  };

  // Metrics calculations
  const totalSubmissions = submissions.length;
  const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
  const failedCount = totalSubmissions - acceptedCount;
  
  const validRuntimes = submissions.filter(s => s.runtime !== undefined && s.runtime !== null).map(s => Number(s.runtime));
  const avgRuntime = validRuntimes.length > 0 
    ? (validRuntimes.reduce((acc, curr) => acc + curr, 0) / validRuntimes.length).toFixed(3)
    : '0.000';

  if (loading) {
    return (
      <div className="space-y-6 py-4">
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-zinc-900/60 border border-zinc-850 rounded-xl"></div>
          ))}
        </div>
        {/* Skeleton Table */}
        <div className="h-64 bg-zinc-900/40 border border-zinc-850 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl shadow-md my-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 text-zinc-100 font-sans">
      
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 bg-zinc-900/10 rounded-2xl text-center">
          <Code className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">No Submissions Found</h3>
          <p className="text-zinc-500 text-sm mt-1">
            You haven't submitted any solution code for this problem yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Stats Cards Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total submissions card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Runs</p>
                <h4 className="text-2xl font-bold text-white mt-1">{totalSubmissions}</h4>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
            </div>

            {/* Accepted card */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Accepted</p>
                <h4 className="text-2xl font-bold text-emerald-400 mt-1">{acceptedCount}</h4>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Failed card */}
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Failed</p>
                <h4 className="text-2xl font-bold text-rose-400 mt-1">{failedCount}</h4>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Avg Runtime card */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avg Runtime</p>
                <h4 className="text-2xl font-bold text-white mt-1">{avgRuntime}s</h4>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Table Container */}
          <div className="border border-zinc-800/80 rounded-xl bg-zinc-900/10 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full text-zinc-300">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 text-[11px] font-bold tracking-wider uppercase">
                    <th className="py-4 pl-6 w-1/12">#</th>
                    <th className="py-4 w-2/12">Language</th>
                    <th className="py-4 w-2/12">Status</th>
                    <th className="py-4 w-1.5/12">Runtime</th>
                    <th className="py-4 w-1.5/12">Memory</th>
                    <th className="py-4 w-2.5/12">Test Cases</th>
                    <th className="py-4 w-2/12">Submitted</th>
                    <th className="py-4 pr-6 w-1/12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, index) => {
                    const passPct = sub.testCasesTotal > 0 ? (sub.testCasesPassed / sub.testCasesTotal) * 100 : 0;
                    return (
                      <tr key={sub._id} className="hover:bg-zinc-900/30 border-b border-zinc-900 last:border-b-0 transition-colors duration-150">
                        <td className="py-4 pl-6 font-semibold text-zinc-500 text-sm">{index + 1}</td>
                        <td className="py-4 font-mono text-zinc-300 text-sm">{sub.language}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border uppercase ${getStatusColor(sub.status)}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-zinc-300 text-sm">{sub.runtime}s</td>
                        <td className="py-4 font-mono text-zinc-300 text-sm">{formatMemory(sub.memory)}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-300 text-sm whitespace-nowrap">
                              {sub.testCasesPassed}/{sub.testCasesTotal}
                            </span>
                            <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden shadow-inner hidden sm:inline-block">
                              <div 
                                className={`h-full transition-all duration-300 ${sub.status === 'accepted' ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                style={{ width: `${passPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs text-zinc-500">{formatDate(sub.createdAt)}</td>
                        <td className="py-4 pr-6 text-center">
                          <button 
                            className="btn btn-xs bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-md font-semibold transition-all duration-150"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            Code
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-xs text-zinc-500 px-1">
            <p>Showing {submissions.length} submissions</p>
          </div>

        </div>
      )}

      {/* Code View Modal (VS Code styled) */}
      {selectedSubmission && (
        <div className="modal modal-open z-[999] backdrop-blur-sm bg-black/40">
          <div className="modal-box w-11/12 max-w-4xl bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl p-0 overflow-hidden text-zinc-200">
            
            {/* Header Tab Bar */}
            <div className="bg-zinc-950 px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <span className="font-mono text-sm font-semibold text-zinc-300">
                  Solution.{getFileExtension(selectedSubmission.language)}
                </span>
                <span className="badge bg-zinc-900 border-zinc-800 text-[10px] text-zinc-400 font-mono rounded">
                  {selectedSubmission.language.toUpperCase()}
                </span>
              </div>
              <button 
                className="btn btn-sm btn-ghost btn-circle text-zinc-500 hover:text-zinc-200"
                onClick={() => setSelectedSubmission(null)}
              >
                ✕
              </button>
            </div>
            
            {/* Metadata Section */}
            <div className="p-6 border-b border-zinc-900/80 bg-zinc-900/10">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border uppercase ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-950 border border-zinc-850 text-zinc-400">
                  Runtime: <strong className="text-zinc-200">{selectedSubmission.runtime}s</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-950 border border-zinc-850 text-zinc-400">
                  Memory: <strong className="text-zinc-200">{formatMemory(selectedSubmission.memory)}</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-950 border border-zinc-850 text-zinc-400">
                  Pass Rate: <strong className="text-zinc-200">{selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}</strong>
                </span>
              </div>
              
              {selectedSubmission.errorMessage && (
                <div className="alert bg-rose-500/10 border border-rose-500/20 text-rose-400 py-3 px-4 rounded-lg flex items-start gap-2 shadow-sm mt-4 font-mono text-xs overflow-x-auto leading-relaxed">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap">{selectedSubmission.errorMessage}</pre>
                </div>
              )}
            </div>
            
            {/* Editor Workspace */}
            <div className="p-6 bg-zinc-950/40">
              <pre className="p-5 bg-zinc-950 border border-zinc-850 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed max-h-96 text-emerald-400">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>
            
            {/* Footer Action */}
            <div className="px-6 py-4 bg-zinc-900/15 border-t border-zinc-900 flex justify-end">
              <button 
                className="btn btn-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 rounded-lg px-5 h-[34px] min-h-[34px]"
                onClick={() => setSelectedSubmission(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
