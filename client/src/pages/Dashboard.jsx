import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

const statusOptions = ['New', 'Contacted', 'Follow-Up', 'Converted', 'Closed'];
const statusColors = {
  New: '#38bdf8',
  Contacted: '#a78bfa',
  'Follow-Up': '#fde68a',
  Converted: '#4ade80',
  Closed: '#fda4af'
};

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New'
  });
  const [selectedLead, setSelectedLead] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLeads();
  }, [navigate]);

  const handleApiError = (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    setError(err.response?.data?.message || err.message || 'Unable to connect to the server.');
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

  const getQueryParams = () => {
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    return params;
  };

  const handleSearch = async (e) => {
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
      setFormData({ name: '', email: '', phone: '', company: '', source: 'Website', status: 'New' });
      setMessage('New lead added successfully.');
      fetchLeads(getQueryParams());
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
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status });
      }
      fetchLeads(getQueryParams());
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
      const res = await api.post(`/api/leads/${selectedLead.id}/notes`, { text: notesText });
      setSelectedLead(res.data);
      setNotesText('');
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
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map((row) => Object.values(row).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\r\n');
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
    const counts = statusOptions.reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    leads.forEach((lead) => {
      if (counts[lead.status] !== undefined) counts[lead.status] += 1;
    });
    return {
      total: leads.length,
      ...counts
    };
  }, [leads]);

  const chartData = statusOptions.map((status) => ({
    name: status,
    value: summary[status] || 0
  }));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-600">Mini CRM</p>
            <h1 className="text-3xl font-semibold">Lead management dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl">
              Manage leads, follow up with prospects, and export data from a clean admin experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
              className="rounded bg-rose-500 px-4 py-2 text-white shadow hover:bg-rose-600 transition"
            >
              Logout
            </button>
            <button
              onClick={downloadCSV}
              className="rounded bg-cyan-600 px-4 py-2 text-white shadow hover:bg-cyan-700 transition"
            >
              Export CSV
            </button>
          </div>
        </header>

        {error && <div className="mb-6 rounded border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>}
        {message && <div className="mb-6 rounded border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">{message}</div>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total leads</p>
            <p className="mt-4 text-3xl font-semibold">{summary.total}</p>
          </div>
          {statusOptions.map((status) => (
            <div key={status} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>
              <p className="mt-4 text-3xl font-semibold">{summary[status]}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr] mb-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Lead list</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Filter and search current leads by status, name, or company.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => fetchLeads(getQueryParams())}
                    className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700 transition"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="rounded border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-100 transition dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="mt-6 grid gap-4 md:grid-cols-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, company or source"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/20"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-900/20"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map((status) => (<option key={status} value={status}>{status}</option>))}
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-800 transition"
                >
                  Search
                </button>
              </form>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {loading ? (
                      <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading leads...</td></tr>
                    ) : leads.length === 0 ? (
                      <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">No leads found.</td></tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                          <td className="px-4 py-4 font-medium">{lead.name}</td>
                          <td className="px-4 py-4">{lead.company || '—'}</td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">{lead.source || 'Website'}</td>
                          <td className="px-4 py-4 space-x-2">
                            <button
                              onClick={() => fetchLeadDetails(lead.id)}
                              className="rounded bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-700 transition"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold">Status distribution</h2>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.name} fill={statusColors[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Leads']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold">Add new lead</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Quickly add new prospects to start tracking them.</p>
              <form onSubmit={handleCreateLead} className="mt-6 space-y-4">
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  required
                />
                <input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social">Social</option>
                    <option value="Event">Event</option>
                  </select>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-white hover:bg-cyan-700 transition"
                >
                  {loading ? 'Saving...' : 'Add lead'}
                </button>
              </form>
            </div>

            {selectedLead && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Lead details</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review notes, update status, or follow up.</p>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="rounded-full bg-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                  <p><strong>Name:</strong> {selectedLead.name}</p>
                  <p><strong>Email:</strong> {selectedLead.email}</p>
                  <p><strong>Company:</strong> {selectedLead.company || '—'}</p>
                  <p><strong>Phone:</strong> {selectedLead.phone || '—'}</p>
                  <p><strong>Source:</strong> {selectedLead.source || 'Website'}</p>
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status update</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</p>
                  <div className="mt-3 space-y-3">
                    {selectedLead.Notes?.length ? selectedLead.Notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                        <p>{note.text}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No notes yet.</p>
                    )}
                  </div>
                  <form onSubmit={handleAddNote} className="mt-4 space-y-3">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      rows="3"
                      placeholder="Add a note for this lead"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                    <button className="rounded-xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-800 transition">Save note</button>
                  </form>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
