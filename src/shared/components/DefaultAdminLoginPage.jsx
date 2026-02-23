// src/shared/components/DefaultAdminLoginPage.jsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader, AlertCircle, Database, Settings } from 'lucide-react';
import defaultAdminConfig from '../config/DefaultAdminUser.json';

export default function DefaultAdminLoginPage({ onLogin, isLoading = false, appName = 'Knowvana' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    // Validate against default admin config
    if (email !== defaultAdminConfig.email || password !== defaultAdminConfig.password) {
      setError('Invalid email or password');
      return;
    }

    try {
      await onLogin({
        email: defaultAdminConfig.email,
        displayName: defaultAdminConfig.displayName,
        role: defaultAdminConfig.role,
        permissions: defaultAdminConfig.permissions,
        isDefaultAdmin: true
      });
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-200 mb-4">
            <span className="text-white text-2xl font-bold">⚙️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{appName}</h1>
          <p className="text-slate-500 mt-2">Default Admin Setup</p>
          <p className="text-xs text-slate-400 mt-3 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
            This is the initial setup page. Use the default admin credentials to initialize the application.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-white/50 p-8">
          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-700">
              <p className="font-semibold">Initial Setup Mode</p>
              <p className="text-xs mt-1">After login, you'll only see database initialization and app configuration options.</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@knowvana.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-slate-200 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-200"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-600 font-semibold mb-2">After Login, You Can:</p>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Database size={14} className="text-teal-600" />
                Initialize Database & Create Default Admin
              </li>
              <li className="flex items-center gap-2">
                <Settings size={14} className="text-teal-600" />
                Configure Application Settings
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Powered by <span className="font-semibold text-slate-500">{appName}</span>
        </p>
      </div>
    </div>
  );
}
