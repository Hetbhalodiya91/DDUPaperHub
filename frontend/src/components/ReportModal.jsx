import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ReportModal = ({ paper, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !paper) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for reporting.');
      return;
    }

    if (!user) {
      setError('You must be signed in to submit a report.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reports', {
        paperId: paper.id,
        reason: reason.trim(),
      });

      if (res.data?.success) {
        setReason('');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/50">
          <div className="flex items-center space-x-2 text-amber-700">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900">Report Inappropriate / Incorrect File</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Resource Details
            </label>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-sm">
              <div className="font-semibold text-slate-800">{paper.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {paper.subjectCode} - {paper.subjectName} ({paper.examYear})
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              What is wrong with this file? *
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Wrong exam year, blurry pages, missing questions, incorrect subject, or copyright concern..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none transition-all resize-none"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
