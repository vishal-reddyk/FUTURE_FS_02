import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/app');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Admin Login</h2>
        {error && <div className="mb-4 rounded bg-red-100 text-red-700 p-3">{error}</div>}
        <label className="block mb-2 text-slate-700 dark:text-slate-200">Email</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          placeholder="admin@demo.com"
        />
        <label className="block mb-2 text-slate-700 dark:text-slate-200">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          placeholder="password"
        />
        <button className="w-full bg-cyan-600 hover:bg-cyan-700 transition text-white p-3 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
