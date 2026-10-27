import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, AlertCircle, CheckCircle, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="bg-ddu-600 text-white p-2 rounded-xl shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            DDU<span className="text-ddu-600">PaperHub</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
        <p className="text-xs text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-ddu-600 hover:text-ddu-500">
            register as a new student
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {/* Quick Demo Login Switcher */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>One-Click Demo Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@ddu.ac.in', 'Admin@123')}
                className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('contributor@ddu.ac.in', 'Contributor@123')}
                className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition-colors"
              >
                Contributor
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student@ddu.ac.in', 'Student@123')}
                className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
              >
                Student
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ddu.ac.in"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-ddu-600 hover:bg-ddu-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
