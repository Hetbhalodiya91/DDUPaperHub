import React from 'react';
import { BookOpen, Heart, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="bg-ddu-500 text-white p-1.5 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                DDU<span className="text-ddu-400">PaperHub</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier open academic archive for Dharmsinh Desai University students. Browse, preview, and download verified previous-year exam papers, lab manuals, and lecture notes.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin-curated and verified educational resources</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">Search Question Papers</Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-white transition-colors">Contribute Papers</Link>
              </li>
              <li>
                <Link to="/search?resourceType=SESSIONAL_1" className="hover:text-white transition-colors">Sessional 1 Papers</Link>
              </li>
              <li>
                <Link to="/search?resourceType=SESSIONAL_2" className="hover:text-white transition-colors">Sessional 2 Papers</Link>
              </li>
              <li>
                <Link to="/search?resourceType=SESSIONAL_3" className="hover:text-white transition-colors">Sessional 3 Papers</Link>
              </li>
              <li>
                <Link to="/search?resourceType=EXTERNAL" className="hover:text-white transition-colors">External Exam Papers</Link>
              </li>
            </ul>
          </div>

          {/* Role Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Role Matrix
            </h4>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex items-start space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Student:</strong> Search, preview, download & report files</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Contributor:</strong> Upload academic papers & track review status</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Admin:</strong> Approve/reject uploads, change user roles & moderate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DDUPaperHub. Built for DDU Students & Faculty.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Crafted for academic excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
