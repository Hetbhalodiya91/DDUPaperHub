import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Clock, 
  ArrowRight,
  UserCheck,
  Send,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { PDFModal } from '../components/PDFModal';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'users' | 'reports' | 'audit'
  const [dashboard, setDashboard] = useState(null);

  // Review Queue state
  const [queuePapers, setQueuePapers] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);

  // Rejection Modal state
  const [rejectingPaper, setRejectingPaper] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditAction, setAuditAction] = useState('');

  const [notification, setNotification] = useState('');

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const loadDashboard = () => {
    api.get('/admin/dashboard')
      .then((res) => setDashboard(res.data?.data))
      .catch((err) => console.error(err));
  };

  const loadQueue = () => {
    setQueueLoading(true);
    api.get('/admin/papers/review-queue?status=PENDING&size=50')
      .then((res) => setQueuePapers(res.data?.data?.content || []))
      .finally(() => setQueueLoading(false));
  };

  const loadUsers = () => {
    setUsersLoading(true);
    api.get('/admin/users')
      .then((res) => setUsers(res.data?.data || []))
      .finally(() => setUsersLoading(false));
  };

  const loadReports = () => {
    setReportsLoading(true);
    api.get('/admin/reports?size=50')
      .then((res) => setReports(res.data?.data?.content || []))
      .finally(() => setReportsLoading(false));
  };

  const loadAuditLogs = (action = '') => {
    setAuditLoading(true);
    const params = action ? `?action=${action}&size=100` : '?size=100';
    api.get(`/admin/audit-logs${params}`)
      .then((res) => setAuditLogs(res.data?.data?.content || []))
      .catch((err) => console.error(err))
      .finally(() => setAuditLoading(false));
  };

  useEffect(() => {
    loadDashboard();
    loadQueue();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'queue') loadQueue();
    if (activeTab === 'audit') loadAuditLogs(auditAction);
  }, [activeTab]);

  // Review actions
  const handleApprove = async (paperId) => {
    try {
      await api.put(`/admin/papers/${paperId}/review`, { status: 'APPROVED' });
      notify('Paper approved successfully and published to students!');
      loadQueue();
      loadDashboard();
    } catch (err) {
      notify('Failed to approve paper: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingPaper) return;
    try {
      await api.put(`/admin/papers/${rejectingPaper.id}/review`, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      });
      notify('Paper rejected. Contributor notified with feedback.');
      setRejectingPaper(null);
      setRejectionReason('');
      loadQueue();
      loadDashboard();
    } catch (err) {
      notify('Failed to reject paper: ' + (err.response?.data?.message || err.message));
    }
  };

  // Role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      notify(`User role updated to ${newRole}`);
      loadUsers();
      loadDashboard();
    } catch (err) {
      notify('Could not update role: ' + (err.response?.data?.message || err.message));
    }
  };

  // Status toggle
  const handleToggleStatus = async (userId, currentEnabled) => {
    try {
      await api.put(`/admin/users/${userId}/status?enabled=${!currentEnabled}`);
      notify(`User ${!currentEnabled ? 'enabled' : 'disabled'}`);
      loadUsers();
    } catch (err) {
      notify('Could not change status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Report resolution
  const handleReportStatus = async (reportId, newStatus) => {
    try {
      await api.put(`/admin/reports/${reportId}/status?status=${newStatus}`);
      notify(`Report marked as ${newStatus}`);
      loadReports();
    } catch (err) {
      notify('Could not update report');
    }
  };

  const handleDeletePaper = async (paperId) => {
    if (!window.confirm('Are you sure you want to permanently delete this resource?')) return;
    try {
      await api.delete(`/admin/papers/${paperId}`);
      notify('Resource deleted.');
      loadQueue();
      loadReports();
      loadDashboard();
    } catch (err) {
      notify('Could not delete resource');
    }
  };

  const auditActionColor = (action) => {
    if (!action) return 'bg-slate-100 text-slate-700';
    const a = action.toUpperCase();
    if (a.includes('APPROVED')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (a.includes('REJECTED') || a.includes('DELETED')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (a.includes('UPLOADED')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (a.includes('ROLE')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (a.includes('STATUS')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (a.includes('REPORT')) return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-slate-100 text-slate-700';
  };

  const formatAuditTimestamp = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Administrative Control Center
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles, review uploads, and moderate academic resources.
          </p>
        </div>

        {/* Global Notification Toast */}
        {notification && (
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg animate-in fade-in">
            {notification}
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Approved Papers</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {dashboard.paperStats?.totalApproved || 0}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Published to students</div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm">
            <div className="text-xs font-bold uppercase text-amber-700 dark:text-amber-500">Pending Review</div>
            <div className="text-2xl font-extrabold text-amber-800 dark:text-amber-400 mt-1">
              {dashboard.paperStats?.totalPending || 0}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">Requires admin approval</div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Users</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {dashboard.totalUsers || 0}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {dashboard.totalContributors || 0} approved contributors
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-400">Total Students</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {dashboard.totalStudents || 0}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">Active student readers</div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Upload Review Queue</span>
          {dashboard?.paperStats?.totalPending > 0 && (
            <span className="bg-amber-400 text-amber-950 text-xs px-2 py-0.5 rounded-full font-extrabold">
              {dashboard.paperStats.totalPending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User &amp; Role Management</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Student Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Tab 1: Upload Review Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {queueLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 h-24 animate-pulse"></div>
              ))}
            </div>
          ) : queuePapers.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {queuePapers.map((paper) => (
                  <div key={paper.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-50 text-purple-700 font-semibold text-xs px-2.5 py-0.5 rounded border border-purple-100">
                          {paper.departmentCode} • Sem {paper.semester}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                          {paper.subjectCode} - {paper.subjectName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Year: {paper.examYear}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {paper.title}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Uploaded by <strong className="text-slate-700 dark:text-slate-300">{paper.uploaderName}</strong> • {paper.fileName} ({(paper.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => setPreviewPaper(paper)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 border border-slate-200 dark:border-slate-600 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect PDF</span>
                      </button>

                      <button
                        onClick={() => handleApprove(paper.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => setRejectingPaper(paper)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 flex items-center space-x-1 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">Queue is All Clear!</h3>
              <p className="text-sm">There are no pending resource uploads waiting for review.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User & Role Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Registered Users &amp; Permissions
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Assign Contributor role to allow verified faculty/students to upload
            </span>
          </div>

          {usersLoading ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Current Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs font-semibold border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                        >
                          <option value="ROLE_STUDENT">Student</option>
                          <option value="ROLE_CONTRIBUTOR">Contributor</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          u.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.enabled)}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
                        >
                          {u.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Student Reports Desk */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Student Quality &amp; Accuracy Reports
            </h3>
          </div>

          {reportsLoading ? (
            <div className="p-8 text-center text-slate-400">Loading reports...</div>
          ) : reports.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {reports.map((rep) => (
                <div key={rep.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        rep.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {rep.status}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">
                        {rep.paperTitle}
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 bg-rose-50/70 p-2 rounded-lg border border-rose-100">
                      <strong>Issue Reported:</strong> "{rep.reason}"
                    </p>
                    <div className="text-xs text-slate-400">
                      Reported by {rep.reporterName} ({rep.reporterEmail})
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {rep.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleReportStatus(rep.id, 'RESOLVED')}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleReportStatus(rep.id, 'DISMISSED')}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-lg"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeletePaper(rep.paperId)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-lg border border-red-200"
                      title="Delete Reported File"
                    >
                      Delete File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">No issues currently reported by students.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Audit Trail</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">All admin and system actions in chronological order</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={auditAction}
                onChange={(e) => {
                  setAuditAction(e.target.value);
                  loadAuditLogs(e.target.value);
                }}
                className="text-xs font-semibold border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="PAPER_UPLOADED">Paper Uploaded</option>
                <option value="PAPER_APPROVED">Paper Approved</option>
                <option value="PAPER_REJECTED">Paper Rejected</option>
                <option value="PAPER_DELETED">Paper Deleted</option>
                <option value="USER_ROLE_CHANGED">Role Changed</option>
                <option value="USER_STATUS_CHANGED">Status Changed</option>
                <option value="REPORT_RESOLVED">Report Resolved</option>
                <option value="REPORT_DISMISSED">Report Dismissed</option>
              </select>
            </div>
          </div>

          {auditLoading ? (
            <div className="p-8 text-center text-slate-400">Loading audit logs...</div>
          ) : auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Actor</th>
                    <th className="px-4 py-3.5">Resource</th>
                    <th className="px-4 py-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatAuditTimestamp(log.createdAt || log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${auditActionColor(log.action)}`}>
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {log.actorEmail || log.performedByEmail || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                        {log.resourceTitle || log.targetDescription || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-500 max-w-[220px] truncate">
                        {log.details || log.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No audit logs found{auditAction ? ` for action: ${auditAction}` : ''}.</p>
            </div>
          )}
        </div>
      )}

      {/* PDF Inspect Modal */}
      <PDFModal
        paper={previewPaper}
        isOpen={Boolean(previewPaper)}
        onClose={() => setPreviewPaper(null)}
        onOpenReport={() => {}}
      />

      {/* Reject Modal */}
      {rejectingPaper && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-rose-50/50 dark:bg-rose-900/20 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Reject Submission
              </h3>
              <button
                onClick={() => setRejectingPaper(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Rejection Reason / Contributor Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Scanned pages are blurry or incomplete. Please re-scan with clear lighting and submit again."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 resize-none bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPaper(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
