import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { UploadPage } from './pages/UploadPage';
import { MySubmissionsPage } from './pages/MySubmissionsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookmarksPage } from './pages/BookmarksPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Auth-required Routes (any logged-in user) */}
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_CONTRIBUTOR', 'ROLE_ADMIN']}>
                    <BookmarksPage />
                  </ProtectedRoute>
                }
              />

              {/* Contributor / Admin Protected Routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CONTRIBUTOR', 'ROLE_ADMIN']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-submissions"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CONTRIBUTOR', 'ROLE_ADMIN']}>
                    <MySubmissionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
