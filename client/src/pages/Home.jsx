import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import { Terminal, Filter, Tag, CheckCircle2, ChevronRight, LogOut, SlidersHorizontal, Search, Settings, User, Sun, Moon } from 'lucide-react';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoadingData(true);
        const { data } = await axiosClient.get('/problem/getAllProblem');
        const mappedProblems = data.map(p => ({
          ...p,
          difficulty: p.difficultylevel,
          tags: p.tag === 'linkedlist' ? 'linkedList' : p.tag
        }));
        setProblems(mappedProblems);

        if (user) {
          const solvedRes = await axiosClient.get('/problem/problemSolvedByUser');
          const mappedSolved = solvedRes.data.map(p => ({
            ...p,
            difficulty: p.difficultylevel,
            tags: p.tag === 'linkedlist' ? 'linkedList' : p.tag
          }));
          setSolvedProblems(mappedSolved);
        }
      } catch (error) {
        console.error('Error loading problems data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadAllData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                        solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-zinc-950/65 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md shadow-indigo-500/10">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <NavLink to="/" className="text-xl font-bold tracking-tight">
                Algo<span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Sphere</span>
              </NavLink>
            </div>
            <div className="hidden sm:flex items-center gap-4 ml-2 border-l border-zinc-800 pl-4">
              <NavLink 
                to="/leaderboard" 
                className={({ isActive }) => `text-sm font-semibold transition-colors duration-150 ${isActive ? 'text-purple-400' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Leaderboard
              </NavLink>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggler */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-300 transition-all cursor-pointer flex items-center justify-center h-10 w-10"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost hover:bg-zinc-850 p-1 rounded-full flex items-center gap-2 border border-zinc-800 bg-zinc-900/40 text-zinc-300">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName}&background=6366f1&color=fff&rounded=true&bold=true&size=128`}
                  className="w-8 h-8 rounded-full border border-zinc-700 shadow-md"
                  alt="Profile"
                />
                <span className="font-semibold text-sm pr-2">{user?.firstName}</span>
              </div>
              <ul tabIndex={0} className="dropdown-content menu p-2 mt-2 shadow-xl bg-zinc-900 border border-zinc-800 rounded-xl w-52 text-zinc-300 z-50">
                <li>
                  <NavLink to="/profile" className="flex items-center gap-2 py-2.5 hover:bg-zinc-800 text-zinc-350">
                    <User className="w-4 h-4 text-purple-400" />
                    My Profile
                  </NavLink>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="flex items-center gap-2 py-2.5 hover:bg-zinc-800 text-indigo-400">
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </NavLink>
                  </li>
                )}
                <li className="border-t border-zinc-800/60 mt-1 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-2 py-2.5 text-red-400 hover:bg-zinc-800">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        
        {/* Header Hero Section */}
        <div className="mb-10 text-left">
          <h1 className="text-3xl font-extrabold text-white mb-2">Practice Playground</h1>
          <p className="text-sm text-zinc-500">Master coding concepts by solving customized challenges</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 bg-zinc-900/20 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <select 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-300 cursor-pointer w-full font-medium"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all" className="bg-zinc-900">All Problems</option>
              <option value="solved" className="bg-zinc-900">Solved</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-300 cursor-pointer w-full font-medium"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all" className="bg-zinc-900">All Difficulties</option>
              <option value="easy" className="bg-zinc-900">Easy</option>
              <option value="medium" className="bg-zinc-900">Medium</option>
              <option value="hard" className="bg-zinc-900">Hard</option>
            </select>
          </div>

          {/* Tags Filter */}
          <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-850 rounded-lg px-3 py-1.5 w-full sm:w-auto">
            <Tag className="w-4 h-4 text-zinc-500" />
            <select 
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-zinc-300 cursor-pointer w-full font-medium"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all" className="bg-zinc-900">All Tags</option>
              <option value="array" className="bg-zinc-900">Array</option>
              <option value="linkedList" className="bg-zinc-900">Linked List</option>
              <option value="graph" className="bg-zinc-900">Graph</option>
              <option value="dp" className="bg-zinc-900">DP</option>
            </select>
          </div>
        </div>

        {/* Problems List */}
        {loadingData ? (
          /* Loading Skeletons */
          <div className="space-y-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-zinc-900/20 border border-zinc-800/80 p-6 rounded-xl animate-pulse flex flex-col gap-3">
                <div className="h-6 w-1/3 bg-zinc-800 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-zinc-800 rounded"></div>
                  <div className="h-5 w-20 bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProblems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10 backdrop-blur-sm">
            <Search className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">No Problems Found</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-sm text-center">
              We couldn't find any challenges matching your filter criteria. Try adjusting your dropdown options!
            </p>
          </div>
        ) : (
          /* Cards List */
          <div className="grid gap-4">
            {filteredProblems.map(problem => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);
              return (
                <div 
                  key={problem._id} 
                  className="group relative bg-zinc-900/30 border border-zinc-800/80 hover:border-purple-500/40 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors duration-200">
                        <NavLink to={`/problem/${problem._id}`}>
                          {problem.title}
                        </NavLink>
                      </h2>
                      {isSolved && (
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Solved
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getDifficultyBadgeColor(problem.difficulty)}`}>
                        {problem.difficulty ? (problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)) : ''}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-zinc-950/60 text-zinc-400 border border-zinc-850">
                        {problem.tags}
                      </span>
                    </div>
                  </div>

                  {/* Solve Button visible on hover / active on desktop */}
                  <div className="flex sm:justify-end items-center">
                    <NavLink 
                      to={`/problem/${problem._id}`} 
                      className="btn sm:opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-none rounded-lg font-medium px-5 py-2.5 shadow-md transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1.5"
                    >
                      Solve Problem
                      <ChevronRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const getDifficultyBadgeColor = (difficulty) => {
  switch ((difficulty || '').toLowerCase()) {
    case 'easy': 
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'medium': 
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'hard': 
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: 
      return 'bg-zinc-950/60 text-zinc-400 border-zinc-850';
  }
};

export default Homepage;