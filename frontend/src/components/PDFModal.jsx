import React from 'react';
import { X, Download, AlertTriangle, Eye, Calendar, BookOpen, ExternalLink } from 'lucide-react';

export const PDFModal = ({ paper, isOpen, onClose, onOpenReport }) => {
  if (!isOpen || !paper) return null;

  const previewUrl = `/api/papers/${paper.id}/preview`;
  const downloadUrl = `/api/papers/${paper.id}/download`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-2">
              <span className="bg-ddu-100 text-ddu-700 text-xs font-semibold px-2 py-0.5 rounded">
                {paper.subjectCode} - Sem {paper.semester}
              </span>
              <span className="bg-slate-200 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
                {paper.examYear}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {paper.departmentName}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-1">
              {paper.title}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenReport(paper)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
              title="Report an issue with this file"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report File</span>
            </button>

            <a
              href={downloadUrl}
              download={paper.fileName}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ddu-600 hover:bg-ddu-700 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-800 relative">
          <iframe
            src={previewUrl}
            title={paper.title}
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-4">
            <span><strong>File:</strong> {paper.fileName}</span>
            <span><strong>Size:</strong> {(paper.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            <span><strong>Uploaded by:</strong> {paper.uploaderName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{paper.viewCount} views</span>
            </span>
            <span className="flex items-center space-x-1">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{paper.downloadCount} downloads</span>
            </span>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ddu-600 hover:underline flex items-center space-x-0.5 ml-2"
            >
              <span>Open in new tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
