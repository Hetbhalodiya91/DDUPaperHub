import React, { useState } from 'react';
import { Download, Eye, Calendar, AlertTriangle, Bookmark, BookmarkCheck, FileText } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ResourceCard = ({ paper, onPreview, onReport, bookmarked: initialBookmarked = false, onBookmarkChange }) => {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const handleBookmarkToggle = async () => {
    if (!user) return;
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${paper.id}`);
        setBookmarked(false);
        onBookmarkChange && onBookmarkChange(paper.id, false);
      } else {
        await api.post(`/bookmarks/${paper.id}`);
        setBookmarked(true);
        onBookmarkChange && onBookmarkChange(paper.id, true);
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const getResourceTypeBadge = (type) => {
    switch (type) {
      case 'SESSIONAL_1':
      case 'MID_SEM_1':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Sessional 1</span>;
      case 'SESSIONAL_2':
      case 'MID_SEM_2':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Sessional 2</span>;
      case 'SESSIONAL_3':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Sessional 3</span>;
      case 'EXTERNAL':
      case 'END_SEM':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">External Exam</span>;
      case 'REMEDIAL':
        return <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Remedial</span>;
      case 'LAB_MANUAL':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Lab Manual</span>;
      case 'LECTURE_NOTES':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">Notes</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Academic Resource</span>;
    }
  };

  const formattedSize = paper.fileSizeBytes ? (paper.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB' : 'PDF';
  const thumbnailUrl = `/api/papers/${paper.id}/thumbnail`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-ddu-300 dark:hover:border-ddu-500 transition-all flex flex-col justify-between group overflow-hidden">
      {/* PDF Thumbnail Banner */}
      <div
        className="w-full h-36 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden cursor-pointer relative"
        onClick={() => onPreview(paper)}
      >
        {!thumbError ? (
          <img
            src={thumbnailUrl}
            alt={`Preview of ${paper.title}`}
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
            <FileText className="w-10 h-10" />
            <span className="text-xs font-medium">PDF Preview</span>
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-ddu-900/0 group-hover:bg-ddu-900/20 transition-colors flex items-center justify-center">
          <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          {/* Top Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {getResourceTypeBadge(paper.resourceType)}
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded-md">
                Sem {paper.semester}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-md flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{paper.examYear}</span>
            </span>
          </div>

          {/* Department & Subject */}
          <div className="flex items-center space-x-1.5 text-xs text-ddu-700 dark:text-ddu-400 font-semibold mb-1">
            <span className="bg-ddu-50 dark:bg-ddu-900/40 px-1.5 py-0.5 rounded border border-ddu-100 dark:border-ddu-800">
              {paper.subjectCode}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-300 truncate">{paper.departmentName}</span>
          </div>

          {/* Paper Title */}
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-ddu-700 dark:group-hover:text-ddu-400 transition-colors line-clamp-2 text-base mt-1">
            {paper.title}
          </h3>

          {paper.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {paper.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700">
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1" title="Views">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{paper.viewCount || 0}</span>
              </span>
              <span className="flex items-center space-x-1" title="Downloads">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>{paper.downloadCount || 0}</span>
              </span>
            </div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">{formattedSize}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPreview(paper)}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-ddu-50 dark:bg-ddu-900/30 hover:bg-ddu-100 dark:hover:bg-ddu-900/50 text-ddu-700 dark:text-ddu-400 rounded-xl text-xs font-semibold transition-colors border border-ddu-200 dark:border-ddu-800"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            <a
              href={`/api/papers/${paper.id}/download`}
              download={paper.fileName}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-ddu-600 hover:bg-ddu-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            {user && (
              <button
                onClick={handleBookmarkToggle}
                disabled={bookmarkLoading}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark this paper'}
                className={`p-2 rounded-xl border transition-colors ${
                  bookmarked
                    ? 'text-ddu-600 bg-ddu-50 border-ddu-200 hover:bg-ddu-100'
                    : 'text-slate-400 hover:text-ddu-600 hover:bg-ddu-50 border-transparent hover:border-ddu-200'
                }`}
              >
                {bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              onClick={() => onReport(paper)}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-transparent hover:border-amber-200 transition-colors"
              title="Report this file"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
