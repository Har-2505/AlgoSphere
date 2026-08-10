import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { User, Mail, Lock, Eye, EyeOff, Terminal, Sun, Moon } from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum character should be 3"),
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password must be at least 6 characters") 
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#09090b] overflow-hidden font-sans">
      {/* Theme Toggler in top-right */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 text-zinc-350 transition-all cursor-pointer flex items-center justify-center h-10 w-10"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="card w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 shadow-2xl shadow-purple-500/5 rounded-2xl z-10 overflow-hidden">
        <div className="card-body p-8 sm:p-10 text-zinc-100">
          
          {/* Brand Logo & Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/25 mb-3">
              <Terminal className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Algo<span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Sphere</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-2">Create your developer account to begin</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* First Name Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-zinc-400 font-medium text-xs">FIRST NAME</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className={`input bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 placeholder-zinc-600 pl-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-full transition-all duration-200 rounded-lg ${errors.firstName ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : ''}`} 
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <span className="text-red-400 text-xs mt-1 block">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-zinc-400 font-medium text-xs">EMAIL ADDRESS</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className={`input bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 placeholder-zinc-600 pl-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-full transition-all duration-200 rounded-lg ${errors.emailId ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('emailId')}
                />
              </div>
              {errors.emailId && (
                <span className="text-red-400 text-xs mt-1 block">{errors.emailId.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-zinc-400 font-medium text-xs">PASSWORD</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input bg-zinc-950/60 border border-zinc-800/80 text-zinc-100 placeholder-zinc-600 pl-10 pr-10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-full transition-all duration-200 rounded-lg ${errors.password ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-control pt-4"> 
              <button
                type="submit"
                className={`btn w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold border-none rounded-lg shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 min-h-[46px] h-[46px]`}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner text-white"></span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <div className="text-center mt-8 pt-4 border-t border-zinc-800/60">
            <span className="text-sm text-zinc-400">
              Already have an account?{' '}
              <NavLink to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-150">
                Login
              </NavLink>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Signup;
