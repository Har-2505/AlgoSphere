import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { Crown, Trophy, Target, Award, Zap, ChevronLeft, Terminal, Activity } from 'lucide-react';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get('/problem/leaderboard');
        setUsers(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load global leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

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

  const topThree = users.slice(0, 3);
  const remainingUsers = users.slice(3);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-amber-400" />;
      case 2: return <Trophy className="w-5 h-5 text-zinc-300" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return <span className="font-mono text-zinc-500 text-xs">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-x-hidden pb-12">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <NavLink to="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors duration-150">
            <ChevronLeft className="w-4 h-4" />
            Back to Playground
          </NavLink>
        </div>

        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2 flex justify-center items-center gap-2">
            <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
            Global Leaderboard
          </h1>
          <p className="text-sm text-zinc-500">Compete with programmers and rank up by solving challenges</p>
        </div>

        {/* Top 3 Podium Highlights */}
        {topThree.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="w-full sm:w-1/3 bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl flex flex-col items-center justify-between text-center relative order-2 sm:order-1 sm:mt-6 shadow-md">
                <Crown className="w-6 h-6 text-zinc-300 mb-2" />
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-300 mb-3 border border-zinc-700">
                  2
                </div>
                <h4 className="font-bold text-zinc-200">{topThree[1].firstName}</h4>
                <div className="mt-2 text-xs font-semibold text-zinc-500">
                  {topThree[1].solvedCount} solved · {topThree[1].score} pts
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="w-full sm:w-[36%] bg-gradient-to-b from-purple-950/20 to-zinc-900/20 border border-purple-500/20 p-6 rounded-2xl flex flex-col items-center justify-between text-center relative order-1 sm:order-2 shadow-xl ring-1 ring-purple-500/10">
                <Crown className="w-8 h-8 text-amber-400 mb-2 animate-pulse" />
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-xl text-white mb-3 shadow-lg shadow-indigo-500/20">
                  1
                </div>
                <h4 className="font-extrabold text-white text-lg">{topThree[0].firstName}</h4>
                <div className="mt-2 text-xs font-bold bg-purple-950/40 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                  {topThree[0].solvedCount} solved · {topThree[0].score} pts
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="w-full sm:w-1/3 bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl flex flex-col items-center justify-between text-center relative order-3 sm:order-3 sm:mt-8 shadow-md">
                <Crown className="w-6 h-6 text-amber-600 mb-2" />
                <div className="w-10 h-10 rounded-xl bg-zinc-850 flex items-center justify-center font-bold text-zinc-400 mb-3 border border-zinc-800">
                  3
                </div>
                <h4 className="font-bold text-zinc-300">{topThree[2].firstName}</h4>
                <div className="mt-2 text-xs font-semibold text-zinc-500">
                  {topThree[2].solvedCount} solved · {topThree[2].score} pts
                </div>
              </div>
            )}

          </div>
        )}

        {/* Leaderboard Table */}
        <div className="border border-zinc-800/80 rounded-2xl bg-zinc-900/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full text-zinc-300">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800/80 text-zinc-400 text-[11px] font-bold tracking-wider uppercase">
                  <th className="py-4 pl-6 w-1/12">Rank</th>
                  <th className="py-4 w-3/12">Programmer</th>
                  <th className="py-4 w-3/12">Solved Breakdown</th>
                  <th className="py-4 w-1.5/12 text-center">Submissions</th>
                  <th className="py-4 w-1.5/12 text-center">Accuracy</th>
                  <th className="py-4 pr-6 w-2/12 text-right">Points Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={item._id} className={`hover:bg-zinc-900/30 border-b border-zinc-900 last:border-b-0 transition-colors duration-150 ${rank <= 3 ? 'bg-zinc-900/10' : ''}`}>
                      <td className="py-4 pl-6 align-middle">
                        <div className="flex items-center justify-start gap-1">
                          {getRankBadge(rank)}
                        </div>
                      </td>
                      <td className="py-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 border border-zinc-700">
                            {item.firstName.charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-bold text-sm ${rank === 1 ? 'text-purple-400' : 'text-zinc-200'}`}>{item.firstName}</span>
                        </div>
                      </td>
                      <td className="py-4 align-middle">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase">{item.solvedBreakdown.easy} E</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase">{item.solvedBreakdown.medium} M</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold uppercase">{item.solvedBreakdown.hard} H</span>
                        </div>
                      </td>
                      <td className="py-4 align-middle text-center font-mono text-xs text-zinc-400">{item.totalSubmissions}</td>
                      <td className="py-4 align-middle text-center">
                        <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-zinc-400 font-mono text-xs font-semibold">
                          {item.accuracy}%
                        </span>
                      </td>
                      <td className="py-4 pr-6 align-middle text-right">
                        <span className="px-3 py-1 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-500/20 text-xs font-extrabold shadow-sm">
                          {item.score} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Leaderboard;
