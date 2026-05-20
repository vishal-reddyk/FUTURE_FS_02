import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaChartLine, FaLock, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/app');
    }
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <main className="min-h-screen bg-[#061326] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8">
        <section className="grid w-full overflow-hidden rounded-xl border border-slate-800 bg-[#071123] shadow-2xl md:grid-cols-[1fr_430px]">
          <div className="hidden border-r border-slate-800 bg-[#030a19] p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-sky-300/40 bg-sky-300/10 text-sky-300">
                <FaChartLine />
              </div>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Mini CRM</p>
              <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
                Simple lead workspace
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
                Track leads, update statuses, add notes, and keep your sales pipeline organized from one simple dashboard.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-slate-200">
              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#071123] p-4">
                <FaUserShield className="text-sky-300" />
                <span>Admin access with demo credentials</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#071123] p-4">
                <FaLock className="text-sky-300" />
                <span>JWT protected CRM workspace</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-10 sm:px-10">
            <div className="w-full max-w-sm">
              <div className="mb-8 text-center md:text-left">
                <p className="text-sm font-semibold uppercase tracking-widest text-sky-300">Welcome back</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Sign in</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Use the demo account to open the CRM dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-[#030a19] px-4 py-3 text-slate-100 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
                    placeholder="admin@demo.com"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-300">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-[#030a19] px-4 py-3 text-slate-100 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/10"
                    placeholder="password"
                  />
                </label>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-200"
                >
                  Login <FaArrowRight className="text-sm" />
                </button>
              </form>

              <div className="mt-6 rounded-lg border border-slate-800 bg-[#030a19] p-4 text-sm text-slate-400">
                <p><span className="font-semibold text-slate-100">Email:</span> admin@demo.com</p>
                <p className="mt-1"><span className="font-semibold text-slate-100">Password:</span> password</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
