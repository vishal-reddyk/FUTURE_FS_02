import React, { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaPlus, FaSearch, FaSignOutAlt, FaSyncAlt, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';

const statusOptions = ['New', 'Contacted', 'Follow-Up', 'Converted', 'Closed'];

const statusStyles = {
  New: 'bg-cyan-400/10 text-cyan-200 border-cyan-400/30',
  Contacted: 'bg-blue-400/10 text-blue-200 border-blue-400/30',
  'Follow-Up': 'bg-amber-400/10 text-amber-200 border-amber-400/30',
  Converted: 'bg-emerald-400/10 text-emerald-200 border-emerald-400/30',
  Closed: 'bg-rose-400/10 text-rose-200 border-rose-400/30'
};

const statusColors = {
  New: '#0ea5e9',
  Contacted: '#8b5cf6',
  'Follow-Up': '#f59e0b',
  Converted: '#10b981',
  Closed: '#f43f5e'
};

const emptyLead = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New'
};

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [summaryData, setSummaryData] = useState({ total: 0, statusCounts: {}, sourceCounts: {} });
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyLead);
  const [selectedLead, setSelectedLead] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    fetchLeads();
    fetchSummary();
    fetchActivity();
  }, [navigate]);

  const handleApiError = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    setError(err.response?.data?.message || err.message || 'Unable to connect to the server.');
  };

  const getQueryParams = () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (filterStatus) params.status = filterStatus;
    return params;
  };

  const fetchLeads = async (params = {}) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/leads', { params });
      setLeads(res.data.leads || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/leads/summary');
      setSummaryData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await api.get('/api/leads/activity');
      setActivity(res.data.activity || []);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = () => {
    fetchLeads(getQueryParams());
    fetchSummary();
    fetchActivity();
  };

  const fetchLeadDetails = async (id) => {
    try {
      setError('');
      const res = await api.get(`/api/leads/${id}`);
      setSelectedLead(res.data);
      setNotesText('');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads(getQueryParams());
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterStatus('');
    fetchLeads();
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await api.post('/api/leads', formData);
      setFormData(emptyLead);
      setMessage('Lead added successfully.');
      refreshAll();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId, status) => {
    try {
      setLoading(true);
      setError('');
      await api.put(`/api/leads/${leadId}`, { status });
      if (selectedLead?.id === leadId) setSelectedLead({ ...selectedLead, status });
      refreshAll();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead permanently?')) return;

    try {
      setLoading(true);
      setError('');
      await api.delete(`/api/leads/${leadId}`);
      setMessage('Lead deleted successfully.');
      if (selectedLead?.id === leadId) setSelectedLead(null);
      refreshAll();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!notesText.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await api.post(`/api/leads/${selectedLead.id}/notes`, { text: notesText.trim() });
      setSelectedLead(res.data);
      setNotesText('');
      fetchActivity();
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const rows = leads.map((lead) => ({
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone || '',
      Company: lead.company || '',
      Source: lead.source || '',
      Status: lead.status || '',
      CreatedAt: new Date(lead.createdAt).toLocaleString()
    }));

    const csv = [
      Object.keys(rows[0] || {}).join(','),
      ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mini-crm-leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    const counts = statusOptions.reduce((acc, status) => {
      acc[status] = summaryData.statusCounts?.[status] || 0;
      return acc;
    }, {});

    return { total: summaryData.total || leads.length, ...counts };
  }, [summaryData, leads]);

  const chartData = useMemo(() => statusOptions.map((status) => ({
    name: status,
    value: summaryData.statusCounts?.[status] || 0
  })), [summaryData]);

  const sourceData = useMemo(() => Object.entries(summaryData.sourceCounts || {}).map(([name, value]) => ({
    name,
    value
  })), [summaryData]);

  const activePipeline = summary.New + summary.Contacted + summary['Follow-Up'];
  const convertedPercent = summary.total ? Math.round((summary.Converted / summary.total) * 100) : 0;
  const topLeads = leads.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#020817] text-slate-100">
      <header className="border-b border-slate-800 bg-[#030a19]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Mini CRM</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Lead Management</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#071123] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50"
            >
              <FaSyncAlt /> Refresh
            </button>
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <FaDownload /> Export CSV
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#071123] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {error && <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
        {message && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div>}

        <section className="mb-6 overflow-hidden rounded-xl border border-slate-800 bg-[#071123] shadow-2xl shadow-cyan-950/20">
          <div className="grid gap-0 md:grid-cols-[1fr_280px]">
            <div className="p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Pipeline overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Keep active leads moving</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                You have {activePipeline} active leads in progress and {summary.Converted} converted leads.
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full rounded-full bg-cyan-400" style={{ width: `${convertedPercent}%` }} />
              </div>
            </div>
            <div className="border-t border-slate-800 bg-[#030a19] p-5 text-white md:border-l md:border-t-0">
              <p className="text-sm text-slate-400">Conversion rate</p>
              <p className="mt-3 text-4xl font-semibold">{convertedPercent}%</p>
              <p className="mt-2 text-sm text-slate-400">Based on current total leads</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-lg border border-slate-800 bg-[#071123] p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-400">Total leads</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.total}</p>
          </div>
          {statusOptions.map((status) => (
            <div key={status} className="rounded-lg border border-slate-800 bg-[#071123] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400/40">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: statusColors[status] }} />
                <p className="text-sm font-medium text-slate-400">{status}</p>
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">{summary[status]}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-[#071123] shadow-sm">
              <div className="border-b border-slate-800 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Leads table</h2>
                    <p className="mt-1 text-sm text-slate-400">Search, filter, update status, and open lead details.</p>
                  </div>
                  <form onSubmit={handleSearch} className="grid gap-3 sm:grid-cols-[1fr_170px_auto_auto]">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search leads"
                      className="h-10 rounded-lg border border-slate-700 bg-[#030a19] px-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-10 rounded-lg border border-slate-700 bg-[#030a19] px-3 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    >
                      <option value="">All statuses</option>
                      {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 text-sm font-semibold text-slate-950">
                      <FaSearch /> Search
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="h-10 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200"
                    >
                      Reset
                    </button>
                  </form>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#030a19] text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400">Loading leads...</td></tr>
                    ) : leads.length === 0 ? (
                      <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400">No leads found.</td></tr>
                    ) : (
                      leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className={`transition hover:bg-cyan-400/5 ${selectedLead?.id === lead.id ? 'bg-cyan-400/10' : ''}`}
                        >
                          <td className="px-5 py-4">
                            <button onClick={() => fetchLeadDetails(lead.id)} className="text-left">
                              <span className="block font-semibold text-white">{lead.name}</span>
                              <span className="block text-xs text-slate-400">{lead.email}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4 text-slate-300">{lead.company || '-'}</td>
                          <td className="px-5 py-4 text-slate-300">{lead.phone || '-'}</td>
                          <td className="px-5 py-4 text-slate-300">{lead.source || 'Website'}</td>
                          <td className="px-5 py-4">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold outline-none ${statusStyles[lead.status] || statusStyles.New}`}
                            >
                              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => fetchLeadDetails(lead.id)}
                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:border-cyan-400/50"
                              >
                                Details
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="rounded-lg border border-red-400/30 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/10"
                                title="Delete lead"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-white">Status chart</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                        {chartData.map((entry) => <Cell key={entry.name} fill={statusColors[entry.name]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Leads']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-white">Lead sources</h2>
                <div className="mt-4 h-72">
                  {sourceData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceData}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#94a3b8' }} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} tick={{ fill: '#94a3b8' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No source data yet.</div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Add lead</h2>
              <form onSubmit={handleCreateLead} className="mt-4 space-y-3">
                <input className="w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10" required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input className="w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10" required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input className="w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10" placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                <input className="w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select className="rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Social</option>
                    <option>Event</option>
                  </select>
                  <select className="rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
                  <FaPlus /> {loading ? 'Saving...' : 'Add lead'}
                </button>
              </form>
            </section>

            {selectedLead && (
              <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedLead.name}</h2>
                    <p className="text-sm text-slate-400">{selectedLead.email}</p>
                  </div>
                  <button onClick={() => setSelectedLead(null)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300">
                    Close
                  </button>
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Company</dt><dd className="font-medium text-slate-100">{selectedLead.company || '-'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Phone</dt><dd className="font-medium text-slate-100">{selectedLead.phone || '-'}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-400">Source</dt><dd className="font-medium text-slate-100">{selectedLead.source || 'Website'}</dd></div>
                </dl>
                <label className="mt-4 block text-sm font-medium text-slate-300">
                  Status
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  >
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-white">Notes</p>
                  <div className="mt-3 space-y-3">
                    {selectedLead.Notes?.length ? selectedLead.Notes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-slate-800 bg-[#030a19] p-3 text-sm">
                        <p className="text-slate-300">{note.text}</p>
                        <p className="mt-2 text-xs text-slate-500">{new Date(note.createdAt).toLocaleString()}</p>
                      </div>
                    )) : <p className="text-sm text-slate-400">No notes yet.</p>}
                  </div>
                  <form onSubmit={handleAddNote} className="mt-3 space-y-3">
                    <textarea
                      rows="3"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#030a19] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                      placeholder="Add a follow-up note"
                    />
                    <button className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950">
                      Save note
                    </button>
                  </form>
                </div>
              </section>
            )}

            <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
              <div className="mt-4 space-y-3">
                {activity.length ? activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="border-l-4 border-cyan-400 bg-[#030a19] px-3 py-2 text-sm">
                    <p className="text-slate-300">{item.text}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.leadName || 'Unknown'} - {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No activity yet.</p>}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#071123] p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Quick list</h2>
              <div className="mt-4 space-y-3">
                {topLeads.map((lead) => (
                  <button key={lead.id} onClick={() => fetchLeadDetails(lead.id)} className="flex w-full items-center justify-between rounded-lg border border-slate-800 bg-[#030a19] px-3 py-2 text-left text-sm hover:border-cyan-400/40">
                    <span>
                      <span className="block font-medium text-white">{lead.name}</span>
                      <span className="block text-xs text-slate-400">{lead.company || lead.email}</span>
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusStyles[lead.status] || statusStyles.New}`}>
                      {lead.status}
                    </span>
                  </button>
                ))}
                {!topLeads.length && <p className="text-sm text-slate-400">No leads yet.</p>}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
