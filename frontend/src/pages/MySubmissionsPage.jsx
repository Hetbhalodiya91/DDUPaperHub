import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  AlertCircle, 
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { PDFModal } from '../components/PDFModal';

export const MySubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchSubmissions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    params.append('page', page);
    params.append('size', '10');

    api.get(`/papers/my-submissions?${params.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setSubmissions(res.data.data.content || []);
          setTotalPages(res.data.data.totalPages || 0);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await api.delete(`/papers/${id}`);
      fetchSubmissions();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not delete paper');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-6 h-6 text-ddu-600" />
            <span>My Submissions Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track the status of academic papers and notes you've submitted.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-ddu-600 hover:bg-ddu-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New</span>
        </Link>
      </div>

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        {[
          { label: 'All Submissions', value: '' },
          { label: 'Pending Review', value: 'PENDING' },
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Rejected', value: 'REJECTED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-ddu-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 h-24 animate-pulse"></div>
          ))}
        </div>
      ) : submissions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {submissions.map((paper) => (
              <div key={paper.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(paper.status)}
                    <span className="text-xs font-semibold text-ddu-700 bg-ddu-50 px-2 py-0.5 rounded border border-ddu-100">
                      {paper.subjectCode} • Sem {paper.semester}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Year: {paper.examYear}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base truncate">
                    {paper.title}
                  </h3>
                  {paper.rejectionReason && (
                    <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-1">
                      <strong>Admin Feedback:</strong> {paper.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setPreviewPaper(paper)}
                    className="p-2 text-slate-600 hover:text-ddu-600 hover:bg-ddu-50 rounded-lg border border-slate-200 transition-colors"
                    title="Preview PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {paper.status === 'PENDING' && (
                    <button
                      onClick={() => handleDelete(paper.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                      title="Withdraw Submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Page {page + 1} of {totalPages}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No submissions found</h3>
          <p className="text-sm">You haven't uploaded any documents under this filter.</p>
          <Link
            to="/upload"
            className="inline-block px-4 py-2 bg-ddu-600 text-white rounded-xl text-sm font-semibold hover:bg-ddu-700 shadow-sm"
          >
            Upload Academic Resource
          </Link>
        </div>
      )}

      {/* PDF Modal */}
      <PDFModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
        onOpenReport={() => {}}
      />
    </div>
  );
};
