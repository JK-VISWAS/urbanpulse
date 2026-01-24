import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AdminLogin = ({ onAuthorized }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (passcode === 'ADMIN_INDIA_2026') {
      onAuthorized?.();
      setError('');
    } else {
      setError('Invalid admin passcode');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 md:p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] md:rounded-[40px] p-6 md:p-10 w-full max-w-md shadow-2xl text-white">
        <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">Terminal Admin</h2>
        <p className="text-slate-300 mb-6">Authorize Session</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Admin Passcode"
              autoComplete="current-password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-slate-300 outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <div className="text-rose-400 text-sm">{error}</div>}
          <button className="w-full bg-rose-600 text-white p-3 md:p-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-rose-700 transition-all">
            Authorize
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
