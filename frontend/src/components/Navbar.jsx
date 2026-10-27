import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Upload, 
  ShieldCheck, 
  FileText, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X,
  Layers,
  Moon,
  Sun,
  Bookmark
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin, isContributor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode state — persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ddu_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ddu_dark_mode', darkMode);
  }, [darkMode]);

  const toggleDark = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="bg-purple-100 text-purple-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-purple-200">Admin</span>;
      case 'ROLE_CONTRIBUTOR':
        return <span className="bg-amber-100 text-amber-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">Contributor</span>;
      default:
        return <span className="bg-blue-100 text-blue-700 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-blue-200">Student</span>;
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-tr from-ddu-700 to-ddu-500 text-white p-2 rounded-xl shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  DDU<span className="text-ddu-600">PaperHub</span>
                </span>
                <span className="hidden sm:inline-block ml-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  Academic Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:space-x-1 ml-6">
              <Link
                to="/search"
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/search')
                    ? 'bg-ddu-50 text-ddu-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Browse Papers</span>
              </Link>

              {isContributor && (
                <>
                  <Link
                    to="/upload"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/upload')
                        ? 'bg-ddu-50 text-ddu-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Resource</span>
                  </Link>

                  <Link
                    to="/my-submissions"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/my-submissions')
                        ? 'bg-ddu-50 text-ddu-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>My Submissions</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Account / Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Bookmarks link */}
                <Link
                  to="/bookmarks"
                  title="My Bookmarks"
                  className={`p-2 rounded-lg transition-colors ${
                    isActive('/bookmarks')
                      ? 'text-ddu-700 bg-ddu-50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-ddu-700 hover:bg-ddu-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </Link>

                <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {user.name}
                    </span>
                    <span className="mt-0.5">{getRoleBadge(user.role)}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-ddu-600 hover:bg-ddu-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            <Search className="w-5 h-5 text-slate-500" />
            <span>Browse Papers</span>
          </Link>

          {isContributor && (
            <>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <Upload className="w-5 h-5 text-slate-500" />
                <span>Upload Resource</span>
              </Link>
              <Link
                to="/my-submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                <FileText className="w-5 h-5 text-slate-500" />
                <span>My Submissions</span>
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-purple-700 hover:bg-purple-50"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-1">
                  <div>
                    <div className="font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-ddu-600 text-white rounded-lg text-sm font-medium hover:bg-ddu-700 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
