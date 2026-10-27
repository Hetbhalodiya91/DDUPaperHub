import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Download, 
  Upload, 
  ShieldCheck, 
  GraduationCap, 
  FileCheck, 
  Users, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import { PDFModal } from '../components/PDFModal';
import { ReportModal } from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isContributor } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [departments, setDepartments] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [stats, setStats] = useState({ totalApproved: 0 });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [previewPaper, setPreviewPaper] = useState(null);
  const [reportPaper, setReportPaper] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/departments').catch(() => ({ data: { data: [] } })),
      api.get('/papers/search?size=6').catch(() => ({ data: { data: { content: [] } } })),
      api.get('/papers/stats').catch(() => ({ data: { data: { totalApproved: 0 } } })),
    ]).then(([deptRes, papersRes, statsRes]) => {
      setDepartments(deptRes.data?.data || []);
      setRecentPapers(papersRes.data?.data?.content || []);
      setStats(statsRes.data?.data || { totalApproved: 0 });
      setLoading(false);
    });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ddu-900 via-ddu-800 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-ddu-700/60 border border-ddu-500/30 px-3.5 py-1.5 rounded-full text-xs font-medium text-ddu-200 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Official Academic Resource Repository for DDU</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Crack Every Exam with <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-teal-200">
              Verified Previous-Year Papers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Instant access to verified Sessional 1, 2, 3 &amp; External university exam papers, lab manuals, and lecture notes across all engineering departments and semesters.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5 border-2 border-white/20 focus-within:border-ddu-400 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by subject name, code (e.g. CE401, DAA), or exam year..."
                className="w-full px-3 py-2.5 text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-ddu-600 hover:bg-ddu-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Semester Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium mr-1">Quick Semesters:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <Link
                key={sem}
                to={`/search?semester=${sem}`}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg border border-white/10 transition-colors"
              >
                Sem {sem}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Department Filter Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-ddu-600" />
              <span>Browse by Department</span>
            </h2>
            <Link to="/search" className="text-xs font-semibold text-ddu-600 hover:text-ddu-800 flex items-center space-x-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                to={`/search?departmentId=${dept.id}`}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-ddu-50 hover:border-ddu-300 text-center transition-all group"
              >
                <div className="text-lg font-bold text-slate-800 group-hover:text-ddu-700">
                  {dept.code}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">
                  {dept.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Uploads Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Recently Added Papers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Verified question papers and academic notes uploaded by faculty and contributors.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-ddu-700 bg-ddu-50 hover:bg-ddu-100 border border-ddu-200 transition-colors shrink-0"
          >
            <span>Explore All Resources</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : recentPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPapers.map((paper) => (
              <ResourceCard
                key={paper.id}
                paper={paper}
                onPreview={(p) => setPreviewPaper(p)}
                onReport={(p) => setReportPaper(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800">No papers uploaded yet</h3>
            <p className="text-sm mt-1">Be the first contributor to share question papers with fellow students.</p>
            <Link
              to="/upload"
              className="mt-4 inline-block px-4 py-2 bg-ddu-600 text-white rounded-lg text-sm font-medium hover:bg-ddu-700 shadow-sm"
            >
              Upload Paper
            </Link>
          </div>
        )}
      </section>

      {/* Role Workflow & Community Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-ddu-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-ddu-400 bg-ddu-900/80 px-3 py-1 rounded-full border border-ddu-700">
              Community Driven &amp; Moderated
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Every paper is reviewed before publishing to ensure high academic quality.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Students get verified question papers without broken scans. Contributors earn recognition across the DDU campus. Admins ensure inappropriate or copyrighted material is never hosted.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={user ? "/upload" : "/login"}
                className="px-5 py-2.5 bg-ddu-600 hover:bg-ddu-500 text-white font-semibold rounded-xl text-sm shadow-md transition-colors flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Become a Contributor</span>
              </Link>
              <Link
                to="/search"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-colors"
              >
                Browse Archive
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <PDFModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
        onOpenReport={(p) => {
          setPreviewPaper(null);
          setReportPaper(p);
        }}
      />

      <ReportModal
        paper={reportPaper}
        isOpen={Boolean(reportPaper)}
        onClose={() => setReportPaper(null)}
        onSuccess={() => setReportSuccess(true)}
      />

      {reportSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg z-50 text-sm flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <FileCheck className="w-5 h-5" />
          <span>Report submitted successfully. Thank you for keeping DDU PaperHub clean!</span>
          <button onClick={() => setReportSuccess(false)} className="ml-2 font-bold">×</button>
        </div>
      )}
    </div>
  );
};
