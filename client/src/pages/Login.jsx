import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('password');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      window.location.href = '/app';
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">Admin Login</h2>
        <label className="block mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <label className="block mb-2">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full mb-4 p-2 border rounded" />
        <button className="w-full bg-cyan-600 text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default Login;
