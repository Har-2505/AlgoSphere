import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { Maximize2, Settings, CheckCircle2, Timer, Play, Pause, RotateCcw, EyeOff, Sun, Moon } from 'lucide-react';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Tick the timer
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to extract starter code based on selected language and database startcode schema
  const getInitialCode = (problemData, lang) => {
    if (!problemData || !problemData.startcode || !Array.isArray(problemData.startcode)) return '';
    const found = problemData.startcode.find(sc => {
      const scLang = sc.language.toLowerCase();
      if (scLang === 'c++' || scLang === 'cpp') return lang === 'cpp';
      if (scLang === 'java') return lang === 'java';
      if (scLang === 'javascript' || scLang === 'js') return lang === 'javascript';
      return false;
    });
    return found ? found.initalCode : '';
  };

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);
        const initialCode = getInitialCode(response.data, selectedLanguage);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const initialCode = getInitialCode(problem, selectedLanguage);
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return 'text-gray-500';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-zinc-800/80 bg-zinc-950/10">
        {/* Left Tabs */}
        <div className="tabs tabs-bordered bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 flex items-center gap-1.5">
          {['description', 'editorial', 'solutions', 'submissions', 'chatai'].map((tab) => (
            <button 
              key={tab}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 border-none capitalize ${
                activeLeftTab === tab 
                  ? 'bg-zinc-800/80 text-white shadow-inner font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab === 'chatai' ? 'Ask AI' : tab}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/20 text-zinc-300">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-white">{problem.title}</h1>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                      (problem.difficultylevel || '').toLowerCase() === 'easy' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : (problem.difficultylevel || '').toLowerCase() === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {problem.difficultylevel ? (problem.difficultylevel.charAt(0).toUpperCase() + problem.difficultylevel.slice(1)) : ''}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-900/60 text-zinc-400 border border-zinc-850">
                      {problem.tag}
                    </span>
                  </div>

                  <div className="prose max-w-none text-zinc-300">
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {problem.dscription}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-zinc-900 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Examples:</h3>
                    <div className="space-y-4">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-xl space-y-3 shadow-md">
                          <h4 className="font-semibold text-sm text-purple-400">Example {index + 1}:</h4>
                          <div className="space-y-2 text-sm font-mono leading-relaxed">
                            <div className="flex"><span className="text-zinc-500 font-bold min-w-[70px]">Input:</span> <span className="text-zinc-200">{example.input}</span></div>
                            <div className="flex"><span className="text-zinc-500 font-bold min-w-[70px]">Output:</span> <span className="text-zinc-200">{example.output}</span></div>
                            <div className="flex"><span className="text-zinc-500 font-bold min-w-[70px]">Explain:</span> <span className="text-zinc-400">{example.explanation}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none text-zinc-300">
                  <h2 className="text-2xl font-bold mb-4 text-white">Editorial & Video Solution</h2>
                  {problem.secureUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                        <video 
                          src={problem.secureUrl} 
                          poster={problem.thumbnailUrl}
                          controls 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-zinc-500">
                        Duration: {Math.floor(problem.duration / 60)}m {Math.floor(problem.duration % 60)}s
                      </p>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-500 bg-zinc-900/10 p-6 border border-dashed border-zinc-800 rounded-xl text-center">
                      {'No video solution uploaded yet for this problem.'}
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-white">Solutions</h2>
                  <div className="space-y-6">
                    {problem.refrenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-zinc-800 bg-zinc-900/20 rounded-xl overflow-hidden shadow-md">
                        <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                          <h3 className="font-semibold text-sm text-zinc-200">{problem?.title}</h3>
                          <span className="badge bg-purple-950/40 text-purple-400 border border-purple-500/20 text-xs font-semibold px-2 py-0.5">{solution?.language}</span>
                        </div>
                        <div className="p-4 bg-zinc-950/40">
                          <pre className="p-4 bg-zinc-950 border border-zinc-850 rounded-lg text-emerald-400 text-sm overflow-x-auto font-mono leading-relaxed">
                            <code>{solution?.completeCode}</code>
                          </pre>
                        </div>
                      </div>
                    )) || <p className="text-zinc-500 italic text-center p-6 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-xl">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <SubmissionHistory problemId={problemId} />
              )}
              {activeLeftTab === 'chatai' && (
                <ChatAi problem={problem} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col border-l border-zinc-800/80 bg-zinc-950/10">
        {/* Right Tabs */}
        <div className="tabs tabs-bordered bg-zinc-950 border-b border-zinc-800/80 px-4 py-2 flex items-center gap-1.5">
          {['code', 'testcase', 'result'].map((tab) => (
            <button 
              key={tab}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 border-none capitalize ${
                activeRightTab === tab 
                  ? 'bg-zinc-800/80 text-white shadow-inner font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col">
          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col">
              {/* Language Selector */}
              <div className="flex justify-between items-center p-4 border-b border-zinc-800/60 bg-zinc-900/10">
                <div className="flex gap-2">
                  {['javascript', 'java', 'cpp'].map((lang) => (
                    <button
                      key={lang}
                      className={`btn btn-sm rounded-lg border border-zinc-800 font-semibold text-xs px-3.5 transition-all duration-200 ${
                        selectedLanguage === lang 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none shadow-lg shadow-indigo-500/10' 
                          : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                      onClick={() => handleLanguageChange(lang)}
                    >
                      {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-zinc-500 mr-1">
                  {/* Timer Widget */}
                  <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg text-zinc-400 text-xs font-semibold">
                    <Timer className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    {showTimer ? (
                      <>
                        <span className="font-mono font-bold text-white min-w-[38px]">{formatTime(time)}</span>
                        <div className="flex items-center gap-1 border-l border-zinc-850 pl-1.5 ml-0.5">
                          <button 
                            onClick={() => setIsRunning(!isRunning)} 
                            className="hover:text-white transition-colors cursor-pointer"
                            title={isRunning ? "Pause Timer" : "Start Timer"}
                          >
                            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>
                          <button 
                            onClick={() => { setTime(0); setIsRunning(false); }} 
                            className="hover:text-white transition-colors cursor-pointer"
                            title="Reset Timer"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setShowTimer(false)} 
                            className="hover:text-white transition-colors ml-0.5 cursor-pointer"
                            title="Hide Timer"
                          >
                            <EyeOff className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => setShowTimer(true)} className="hover:text-white transition-colors text-[10px] uppercase font-bold tracking-wider cursor-pointer">
                        Show Timer
                      </button>
                    )}
                  </div>

                  {/* Theme Toggle Button */}
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-1.5 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer text-zinc-500 flex items-center justify-center" 
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  </button>

                  <button className="p-1.5 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer" title="Settings">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all cursor-pointer" title="Toggle Fullscreen">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 bg-zinc-950">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost btn-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded-lg"
                    onClick={() => setActiveRightTab('testcase')}
                  >
                    Console
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    className={`btn btn-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg px-5 h-[36px] min-h-[36px] ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    Run
                  </button>
                  <button
                    className={`btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none rounded-lg px-6 h-[36px] min-h-[36px] shadow-lg shadow-indigo-500/10 ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto text-zinc-300">
              <h3 className="text-xl font-bold text-white mb-6">Test Results</h3>
              {runResult ? (
                <div className="space-y-4">
                  {runResult.success ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl shadow-sm flex flex-col gap-2">
                      <h4 className="font-bold text-base flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" />
                        All test cases passed!
                      </h4>
                      <div className="flex gap-4 text-xs font-semibold mt-1 text-emerald-300/80">
                        <span>Runtime: {runResult.runtime} sec</span>
                        <span>Memory: {runResult.memory} KB</span>
                      </div>
                      
                      <div className="mt-4 space-y-3">
                        {runResult.testCases && runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg text-zinc-300 shadow-inner">
                            <div className="font-mono text-xs space-y-1.5 leading-relaxed">
                              <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Input:</span> {tc.stdin}</div>
                              <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Expected:</span> {tc.expected_output}</div>
                              <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Output:</span> {tc.stdout}</div>
                              <div className="text-emerald-400 font-bold mt-1 text-[11px]">✓ Passed</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-xl shadow-sm flex flex-col gap-2">
                      <h4 className="font-bold text-base">❌ Error / Failed</h4>
                      {runResult.testCases && (
                        <div className="mt-4 space-y-3">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg text-zinc-300 shadow-inner">
                              <div className="font-mono text-xs space-y-1.5 leading-relaxed">
                                <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Input:</span> {tc.stdin}</div>
                                <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Expected:</span> {tc.expected_output}</div>
                                <div><span className="text-zinc-500 font-bold inline-block min-w-[70px]">Output:</span> {tc.stdout || '(no output)'}</div>
                                {tc.stderr && <div className="text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded mt-2 overflow-x-auto whitespace-pre-wrap"><strong>Error:</strong> {tc.stderr}</div>}
                                <div className={tc.status_id == 3 ? 'text-emerald-400 font-bold mt-1 text-[11px]' : 'text-rose-400 font-bold mt-1 text-[11px]'}>
                                  {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!runResult.testCases && runResult.error && (
                        <pre className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg text-xs text-rose-400 mt-2 whitespace-pre-wrap font-mono leading-relaxed">{runResult.error}</pre>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500 italic text-center p-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto text-zinc-300">
              <h3 className="text-xl font-bold text-white mb-6">Submission Result</h3>
              {submitResult ? (
                <div className="space-y-4">
                  {submitResult.accepted ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl shadow-sm flex flex-col gap-2">
                      <h4 className="font-extrabold text-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-6 h-6" />
                        🎉 Accepted
                      </h4>
                      <div className="mt-4 space-y-2 text-sm font-semibold text-zinc-300">
                        <p>Test Cases Passed: <span className="text-white font-bold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span></p>
                        <p>Runtime: <span className="text-white font-bold">{submitResult.runtime} sec</span></p>
                        <p>Memory: <span className="text-white font-bold">{submitResult.memory} KB</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-xl shadow-sm flex flex-col gap-2">
                      <h4 className="font-extrabold text-lg">❌ Rejected / Wrong Answer</h4>
                      <div className="mt-4 space-y-2 text-sm font-semibold text-zinc-300">
                        <p>Test Cases Passed: <span className="text-white font-bold">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span></p>
                        {submitResult.errorMessage && (
                          <pre className="bg-zinc-950 border border-zinc-850 p-4 rounded-lg text-xs text-rose-400 mt-3 whitespace-pre-wrap font-mono leading-relaxed">{submitResult.errorMessage}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500 italic text-center p-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;