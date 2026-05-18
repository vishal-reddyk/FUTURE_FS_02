import React, { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const Dashboard = () => {
  const [leads, setLeads] = useState([]);

  useEffect(()=>{ fetchLeads(); }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/api/leads');
      setLeads(res.data.leads || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mini CRM Dashboard</h1>
          <div>
            <button onClick={()=>{localStorage.removeItem('token'); window.location.href='/login';}} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">Total Leads<br/><strong>{leads.length}</strong></div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">New Leads<br/><strong>{leads.filter(l=>l.status==='New').length}</strong></div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded shadow">Converted<br/><strong>{leads.filter(l=>l.status==='Converted').length}</strong></div>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded p-4 shadow">
          <h2 className="font-semibold mb-4">Leads</h2>
          {leads.length===0 ? <p>No leads yet</p> : (
            <table className="w-full text-sm">
              <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th></tr></thead>
              <tbody>
                {leads.map(lead=> (
                  <tr key={lead._id} className="border-t"><td>{lead.name}</td><td>{lead.email}</td><td>{lead.company}</td><td>{lead.status}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
