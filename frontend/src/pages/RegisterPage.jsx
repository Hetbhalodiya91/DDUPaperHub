import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
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
        <h2 className="text-xl font-bold text-slate-900">Create your Student Account</h2>
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-ddu-600 hover:text-ddu-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
            <strong>Default Role:</strong> All new accounts receive the <strong>Student</strong> role by default. Admins can elevate your account to <strong>Contributor</strong> upon request.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Patel"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohan.ce@ddu.ac.in"
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
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-ddu-600 hover:bg-ddu-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
