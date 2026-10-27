import React, { useState, useEffect } from 'react';
import { Bookmark, Search, BookmarkX } from 'lucide-react';
import api from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import { PDFModal } from '../components/PDFModal';
import { ReportModal } from '../components/ReportModal';

export const BookmarksPage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [reportPaper, setReportPaper] = useState(null);

  const loadBookmarks = () => {
    setLoading(true);
    api.get('/bookmarks')
      .then((res) => setPapers(res.data?.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleBookmarkChange = (paperId, isBookmarked) => {
    if (!isBookmarked) {
      // Remove from list when un-bookmarked
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-ddu-50 dark:bg-ddu-900/30 rounded-xl border border-ddu-200 dark:border-ddu-800">
          <Bookmark className="w-6 h-6 text-ddu-600 dark:text-ddu-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Bookmarks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Papers and resources you've saved for later review.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-72 animate-pulse" />
          ))}
        </div>
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {papers.map((paper) => (
            <ResourceCard
              key={paper.id}
              paper={paper}
              onPreview={setPreviewPaper}
              onReport={setReportPaper}
              bookmarked={true}
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <BookmarkX className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">No bookmarks yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Browse papers and click the bookmark icon on any resource card to save it here for quick access.
          </p>
          <a
            href="/search"
            className="mt-2 px-5 py-2.5 bg-ddu-600 hover:bg-ddu-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            Browse Papers
          </a>
        </div>
      )}

      {/* Modals */}
      <PDFModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
        onOpenReport={(p) => { setPreviewPaper(null); setReportPaper(p); }}
      />
      <ReportModal
        paper={reportPaper}
        isOpen={Boolean(reportPaper)}
        onClose={() => setReportPaper(null)}
      />
    </div>
  );
};
