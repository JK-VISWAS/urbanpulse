import React, { useState } from 'react';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';

const AuthPage = ({ onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await setDoc(doc(db, "users", res.user.uid), {
          email: formData.email,
          phone: formData.phone,
          role: 'user',
          uid: res.user.uid
        });
      }
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-slate-900 text-white">
      <div className="flex items-center justify-center p-4 md:p-8">
        <form onSubmit={handleAuth} className="bg-white text-slate-900 p-6 md:p-10 rounded-[28px] md:rounded-[40px] shadow-2xl w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-black mb-6 uppercase italic">UrbanPulse Login</h2>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full mb-4 p-4 bg-slate-100 rounded-2xl outline-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {!isLogin && (
            <input
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              className="w-full mb-4 p-4 bg-slate-100 rounded-2xl outline-none"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          )}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="w-full p-4 bg-slate-100 rounded-2xl outline-none pr-12"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-all"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {error && <div className="text-rose-600 text-sm mb-3">{error}</div>}
          <button className="w-full bg-indigo-600 text-white p-4 md:p-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all">
            {isLogin ? 'Citizen Sign In' : 'Create Account'}
          </button>
          <p
            className="mt-6 text-center text-slate-400 cursor-pointer text-sm"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </p>
          <button
            type="button"
            onClick={() => onAdminLogin?.()}
            className="mt-4 w-full text-xs font-bold text-slate-500 uppercase hover:text-rose-500 transition-colors"
          >
            Access Admin Portal
          </button>
        </form>
      </div>

      <div className="relative p-8 hidden md:flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-rose-600/20 blur-3xl" />
        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] p-10 w-full max-w-md shadow-2xl">
          <h3 className="text-xl font-black uppercase tracking-widest text-white mb-4">UrbanPulse</h3>
          <p className="text-slate-200 mb-6">Optimize the grid with secure access.</p>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>• Citizen reports feed</li>
            <li>• Admin command center</li>
            <li>• Live map with pins</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
