import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileUp, CheckCircle2, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('SESSIONAL_1');
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('4');
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/departments')
      .then((res) => {
        const depts = res.data?.data || [];
        setDepartments(depts);
        if (depts.length > 0 && !departmentId) {
          setDepartmentId(depts[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (departmentId && semester) {
      api.get(`/subjects?departmentId=${departmentId}&semester=${semester}`)
        .then((res) => {
          const subs = res.data?.data || [];
          setSubjects(subs);
          if (subs.length > 0) {
            setSubjectId(subs[0].id);
          } else {
            setSubjectId('');
          }
        })
        .catch((err) => console.error(err));
    }
  }, [departmentId, semester]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files (.pdf) are allowed.');
        setFile(null);
        return;
      }
      if (selected.size > 50 * 1024 * 1024) {
        setError('File size exceeds the 50MB limit.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }
    if (!subjectId) {
      setError('Please select a valid subject.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('resourceType', resourceType);
    formData.append('examYear', examYear);
    formData.append('subjectId', subjectId);
    formData.append('file', file);

    try {
      const res = await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload paper. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Submitted Successfully!</h1>
        <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
          Your document is now in the <strong>Pending Review</strong> queue. An administrator will verify the file and publish it to the student directory shortly.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-4">
          <button
            onClick={() => navigate('/my-submissions')}
            className="px-5 py-2.5 bg-ddu-600 hover:bg-ddu-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors"
          >
            Track Submissions
          </button>
          <button
            onClick={() => {
              setSuccess(false);
              setTitle('');
              setDescription('');
              setFile(null);
            }}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Upload className="w-6 h-6 text-ddu-600" />
            <span>Upload Academic Resource</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Contribute verified previous-year papers, notes, or lab manuals.
          </p>
        </div>
      </div>

      {/* Review Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs sm:text-sm text-amber-800">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p>
          <strong>Workflow Note:</strong> All uploads go through an administrative review step before appearing in search results to maintain high educational quality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Paper Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Resource Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Operating Systems End-Semester Exam 2024"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
          />
        </div>

        {/* Department & Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Department *
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.code} - {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Semester *
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Subject *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
          >
            {subjects.length > 0 ? (
              subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))
            ) : (
              <option value="">No subjects found for this department &amp; semester</option>
            )}
          </select>
        </div>

        {/* Resource Type & Exam Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Resource Type *
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none bg-white"
            >
              <option value="SESSIONAL_1">Sessional 1 Exam</option>
              <option value="SESSIONAL_2">Sessional 2 Exam</option>
              <option value="SESSIONAL_3">Sessional 3 Exam</option>
              <option value="EXTERNAL">External Exam</option>
              <option value="REMEDIAL">Remedial Exam</option>
              <option value="LAB_MANUAL">Lab Manual</option>
              <option value="LECTURE_NOTES">Lecture Notes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Exam Year *
            </label>
            <input
              type="number"
              min="1990"
              max="2100"
              required
              value={examYear}
              onChange={(e) => setExamYear(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Description / Topics Covered (Optional)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Includes Unit 1 to 3 with solution hints..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-ddu-500 focus:border-ddu-500 outline-none resize-none"
          />
        </div>

        {/* File Dropzone */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            PDF Document * (Max 50MB)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-2xl hover:border-ddu-400 transition-colors bg-slate-50/50">
            <div className="space-y-2 text-center">
              <FileUp className="mx-auto h-10 w-10 text-slate-400" />
              <div className="flex text-sm text-slate-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-semibold text-ddu-600 hover:text-ddu-500 focus-within:outline-none">
                  <span>Select a PDF file</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-400">PDF up to 50MB</p>
              {file && (
                <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-ddu-600 hover:bg-ddu-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{submitting ? 'Uploading to Server...' : 'Submit for Admin Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
