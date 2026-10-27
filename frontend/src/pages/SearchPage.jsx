import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  BookOpen, 
  FileCheck, 
  ChevronLeft, 
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import api from '../services/api';
import { ResourceCard } from '../components/ResourceCard';
import { PDFModal } from '../components/PDFModal';
import { ReportModal } from '../components/ReportModal';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from query params
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || '');
  const [resourceType, setResourceType] = useState(searchParams.get('resourceType') || '');
  const [examYear, setExamYear] = useState(searchParams.get('examYear') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '0', 10));

  // Options lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Results
  const [papers, setPapers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modals
  const [previewPaper, setPreviewPaper] = useState(null);
  const [reportPaper, setReportPaper] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    api.get('/departments')
      .then((res) => setDepartments(res.data?.data || []))
      .catch((err) => console.error('Error fetching departments', err));
  }, []);

  // Fetch subjects dynamically when department or semester changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);
    if (semester) params.append('semester', semester);

    api.get(`/subjects?${params.toString()}`)
      .then((res) => setSubjects(res.data?.data || []))
      .catch((err) => console.error('Error fetching subjects', err));
  }, [departmentId, semester]);

  // Execute search when filters or page change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (departmentId) params.append('departmentId', departmentId);
    if (semester) params.append('semester', semester);
    if (subjectId) params.append('subjectId', subjectId);
    if (resourceType) params.append('resourceType', resourceType);
    if (examYear) params.append('examYear', examYear);
    params.append('page', page);
    params.append('size', '12');

    // Update URL query params
    setSearchParams(params, { replace: true });

    api.get(`/papers/search?${params.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setPapers(res.data.data.content || []);
          setTotalPages(res.data.data.totalPages || 0);
          setTotalElements(res.data.data.totalElements || 0);
        }
      })
      .catch((err) => console.error('Search error', err))
      .finally(() => setLoading(false));
  }, [keyword, departmentId, semester, subjectId, resourceType, examYear, page]);

  const handleResetFilters = () => {
    setKeyword('');
    setDepartmentId('');
    setSemester('');
    setSubjectId('');
    setResourceType('');
    setExamYear('');
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    keyword || departmentId || semester || subjectId || resourceType || examYear
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Question Papers &amp; Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalElements} verified {totalElements === 1 ? 'resource' : 'resources'} available
          </p>
        </div>

        {/* Search input in header */}
        <div className="flex items-center space-x-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              placeholder="Search subject, code, topic..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
            />
            {keyword && (
              <button
                onClick={() => setKeyword('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className={`md:block ${mobileFilterOpen ? 'block' : 'hidden'} md:col-span-1`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                <Filter className="w-4 h-4 text-ddu-600" />
                <span>Filters</span>
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-ddu-600 hover:text-ddu-800 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSubjectId('');
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setSubjectId('');
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => {
                  setResourceType(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
              >
                <option value="">All Types</option>
                <option value="SESSIONAL_1">Sessional 1 Exam</option>
                <option value="SESSIONAL_2">Sessional 2 Exam</option>
                <option value="SESSIONAL_3">Sessional 3 Exam</option>
                <option value="EXTERNAL">External Exam</option>
                <option value="REMEDIAL">Remedial Exam</option>
                <option value="LAB_MANUAL">Lab Manual</option>
                <option value="LECTURE_NOTES">Lecture Notes</option>
              </select>
            </div>

            {/* Exam Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Exam Year
              </label>
              <select
                value={examYear}
                onChange={(e) => {
                  setExamYear(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
              >
                <option value="">All Years</option>
                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-56 animate-pulse"></div>
              ))}
            </div>
          ) : papers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {papers.map((paper) => (
                  <ResourceCard
                    key={paper.id}
                    paper={paper}
                    onPreview={(p) => setPreviewPaper(p)}
                    onReport={(p) => setReportPaper(p)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-sm">
                  <span className="text-xs text-slate-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No resources matched your filters</h3>
              <p className="text-sm max-w-sm mx-auto text-slate-500">
                Try clearing some filters or searching for broader subject keywords.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-ddu-50 text-ddu-700 font-semibold rounded-xl text-xs hover:bg-ddu-100 border border-ddu-200 transition-colors inline-block"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

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
          <span>Report submitted to administrators. Thank you!</span>
          <button onClick={() => setReportSuccess(false)} className="ml-2 font-bold">×</button>
        </div>
      )}
    </div>
  );
};
