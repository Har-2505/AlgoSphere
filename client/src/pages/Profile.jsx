import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { Award, CheckCircle2, Flame, Calendar, ChevronLeft, Terminal, BookOpen, Layers, Zap } from 'lucide-react';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/profileStats');
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile stats:', err);
        setError('Failed to fetch profile statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute code streak
  const getStreak = (submissionsMap) => {
    if (!submissionsMap) return 0;
    let streak = 0;
    let date = new Date();
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      if (submissionsMap[dateStr] && submissionsMap[dateStr] > 0) {
        streak++;
        date.setDate(date.getDate() - 1);
      } else {
        // If today has 0, check yesterday to keep streak active
        if (streak === 0) {
          date.setDate(date.getDate() - 1);
          const yestStr = date.toISOString().split('T')[0];
          if (submissionsMap[yestStr] && submissionsMap[yestStr] > 0) {
            streak++;
            date.setDate(date.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  // Generate last 365 calendar days aligned by weeks (Sun - Sat)
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    // Start 364 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Adjust to align with Sunday start
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);
    while (currentDate <= today || days.length % 7 !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-100 p-4">
        <div className="alert bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-lg">{error}</span>
          <NavLink to="/" className="btn btn-sm btn-outline btn-error mt-4">Go Home</NavLink>
        </div>
      </div>
    );
  }

  const { totalProblems, solvedProblems, submissions = {}, topics = {}, solvedList = [], score = 0 } = stats || {};

  const totalSolved = (solvedProblems.easy || 0) + (solvedProblems.medium || 0) + (solvedProblems.hard || 0);
  const totalAllProblems = (totalProblems.easy || 0) + (totalProblems.medium || 0) + (totalProblems.hard || 0);
  
  const streakCount = getStreak(submissions);
  const calendarDays = getCalendarDays();

  // Concentric ring constants
  const rEasy = 40;
  const rMed = 28;
  const rHard = 16;

  const pctEasy = totalProblems.easy > 0 ? (solvedProblems.easy / totalProblems.easy) * 100 : 0;
  const pctMed = totalProblems.medium > 0 ? (solvedProblems.medium / totalProblems.medium) * 100 : 0;
  const pctHard = totalProblems.hard > 0 ? (solvedProblems.hard / totalProblems.hard) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-x-hidden pb-12">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Panel */}
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <NavLink to="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors duration-150">
            <ChevronLeft className="w-4 h-4" />
            Back to Playground
          </NavLink>
        </div>

        {/* Header Profile Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Name & Streak */}
          <div className="md:col-span-2 bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-[200px] h-[200px] bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-4">
              {/* Avatar Initial Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/20">
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">{user?.firstName}</h2>
                <p className="text-zinc-500 text-sm flex items-center gap-1.5 mt-1.5">
                  <Calendar className="w-4 h-4" />
                  Developer Profile
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider leading-none">Code Streak</p>
                  <p className="text-lg font-bold text-white mt-1">{streakCount} Days</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider leading-none">Solved</p>
                  <p className="text-lg font-bold text-white mt-1">{totalSolved} Problems</p>
                </div>
              </div>

              <div className="bg-zinc-950/60 border border-zinc-850 px-4 py-2.5 rounded-xl flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider leading-none">Points Score</p>
                  <p className="text-lg font-bold text-white mt-1">{score} pts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between shadow-lg">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              General Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-zinc-850 pb-2">
                <span className="text-zinc-500 font-semibold">Total Problems</span>
                <span className="font-bold text-zinc-200">{totalAllProblems}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-850 pb-2">
                <span className="text-zinc-500 font-semibold">Easy Solved</span>
                <span className="font-bold text-emerald-400">{solvedProblems.easy} <span className="text-zinc-600 font-normal">/ {totalProblems.easy}</span></span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-zinc-850 pb-2">
                <span className="text-zinc-500 font-semibold">Medium Solved</span>
                <span className="font-bold text-amber-400">{solvedProblems.medium} <span className="text-zinc-600 font-normal">/ {totalProblems.medium}</span></span>
              </div>
              <div className="flex justify-between items-center text-sm pb-1">
                <span className="text-zinc-500 font-semibold">Hard Solved</span>
                <span className="font-bold text-rose-400">{solvedProblems.hard} <span className="text-zinc-600 font-normal">/ {totalProblems.hard}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Concentric Progress Rings (SVG based) */}
          <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-between min-h-[320px]">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider w-full text-left mb-6 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              Completion Rates
            </h3>
            
            <div className="relative flex items-center justify-center">
              {/* Radial Meter SVG */}
              <svg className="w-48 h-48 transform -rotate-90">
                {/* Background Concentric Rings */}
                <circle cx="96" cy="96" r={rEasy} className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                <circle cx="96" cy="96" r={rMed} className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                <circle cx="96" cy="96" r={rHard} className="stroke-zinc-800" strokeWidth="6" fill="transparent" />

                {/* Easy Progress Ring */}
                <circle 
                  cx="96" cy="96" r={rEasy} 
                  className="stroke-emerald-500" 
                  strokeWidth="6" fill="transparent" 
                  strokeDasharray={2 * Math.PI * rEasy}
                  strokeDashoffset={(2 * Math.PI * rEasy) - (pctEasy / 100) * (2 * Math.PI * rEasy)}
                  strokeLinecap="round"
                />

                {/* Medium Progress Ring */}
                <circle 
                  cx="96" cy="96" r={rMed} 
                  className="stroke-amber-500" 
                  strokeWidth="6" fill="transparent" 
                  strokeDasharray={2 * Math.PI * rMed}
                  strokeDashoffset={(2 * Math.PI * rMed) - (pctMed / 100) * (2 * Math.PI * rMed)}
                  strokeLinecap="round"
                />

                {/* Hard Progress Ring */}
                <circle 
                  cx="96" cy="96" r={rHard} 
                  className="stroke-rose-500" 
                  strokeWidth="6" fill="transparent" 
                  strokeDasharray={2 * Math.PI * rHard}
                  strokeDashoffset={(2 * Math.PI * rHard) - (pctHard / 100) * (2 * Math.PI * rHard)}
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white leading-none">{totalSolved}</span>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mt-1">Solved</p>
              </div>
            </div>

            {/* Legends */}
            <div className="flex gap-4 mt-6 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Easy
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Med
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                Hard
              </span>
            </div>
          </div>

          {/* Topics breakdown */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Topic Proficiency
            </h3>
            
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {Object.keys(topics).length === 0 ? (
                <p className="text-zinc-500 italic text-center text-sm py-8">Solve problems to view topic insights.</p>
              ) : (
                Object.keys(topics).map(tag => {
                  const item = topics[tag];
                  const percentage = item.total > 0 ? (item.solved / item.total) * 100 : 0;
                  const label = tag.charAt(0).toUpperCase() + tag.slice(1);
                  return (
                    <div key={tag} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-300">{label}</span>
                        <span className="text-zinc-500">
                          {item.solved} <span className="text-zinc-700">/ {item.total} Solved</span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-950 border border-zinc-850 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Github-style Calendar Heatmap */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl shadow-lg relative">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-purple-400" />
            Submission Activity
          </h3>

          <div className="relative overflow-x-auto pb-4">
            {/* Heatmap Tooltip overlay */}
            {hoveredDay && (
              <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-300 shadow-xl z-20 pointer-events-none">
                {hoveredDay.count} submissions on {new Date(hoveredDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}

            {/* Days grid wrapper */}
            <div className="flex gap-1.5 items-start min-w-[700px]">
              {/* Day Labels Column */}
              <div className="grid grid-rows-7 gap-1 text-[9px] font-bold text-zinc-600 pr-2 pt-5 h-[98px]">
                <span>Sun</span>
                <span></span>
                <span>Tue</span>
                <span></span>
                <span>Thu</span>
                <span></span>
                <span>Sat</span>
              </div>

              {/* Grid block container */}
              <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
                {calendarDays.map((day, idx) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const count = submissions[dateStr] || 0;
                  
                  // Color levels
                  let bgStyle = 'bg-zinc-950 border border-zinc-900';
                  if (count === 1) bgStyle = 'bg-purple-900/30 border border-purple-900/10 text-purple-400';
                  else if (count === 2) bgStyle = 'bg-purple-700/50 border border-purple-700/10 text-purple-300';
                  else if (count >= 3) bgStyle = 'bg-purple-500 border border-purple-500/20 text-white';

                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-purple-400 ${bgStyle}`}
                      onMouseEnter={() => setHoveredDay({ date: dateStr, count })}
                      onMouseLeave={() => setHoveredDay(null)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-4 px-1">
            <p>Activity from the last 365 days</p>
            <div className="flex items-center gap-1.5 font-semibold">
              <span>Less</span>
              <div className="w-3 h-3 bg-zinc-950 border border-zinc-900 rounded-[3px]" />
              <div className="w-3 h-3 bg-purple-900/30 border border-purple-900/10 rounded-[3px]" />
              <div className="w-3 h-3 bg-purple-700/50 border border-purple-700/10 rounded-[3px]" />
              <div className="w-3 h-3 bg-purple-500 border border-purple-500/20 rounded-[3px]" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Recently Solved Section */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 p-6 rounded-2xl shadow-lg mt-6 relative">
          <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            Solved Problems List
          </h3>

          {solvedList.length === 0 ? (
            <p className="text-zinc-500 italic text-center text-sm py-8 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-xl">
              You haven't solved any problems yet. Go to Practice Playground to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {solvedList.map((problem) => (
                <div 
                  key={problem._id} 
                  className="bg-zinc-950/60 border border-zinc-850 hover:border-purple-500/30 p-4 rounded-xl flex items-center justify-between transition-all duration-200"
                >
                  <div className="space-y-1.5">
                    <NavLink 
                      to={`/problem/${problem._id}`} 
                      className="text-sm font-bold text-white hover:text-purple-400 transition-colors"
                    >
                      {problem.title}
                    </NavLink>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase ${
                        (problem.difficultylevel || '').toLowerCase() === 'easy' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : (problem.difficultylevel || '').toLowerCase() === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {problem.difficultylevel}
                      </span>
                      <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {problem.tag}
                      </span>
                    </div>
                  </div>
                  <NavLink 
                    to={`/problem/${problem._id}`}
                    className="btn btn-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none text-white font-semibold rounded-md px-3.5 h-[28px] min-h-[28px]"
                  >
                    Practice
                  </NavLink>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;
