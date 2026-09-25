import React, { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface AdminLoginProps {
  onAuthenticated: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = await apiClient.loginAdmin(username, password);
    if (!user) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng.');
      return;
    }

    localStorage.setItem('emic_admin_authenticated', 'true');
    localStorage.setItem('emic_admin_username', user.username);
    onAuthenticated();
  };

  return (
    <main className="admin-page min-h-screen bg-stone-100 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto">
          <LockKeyhole className="w-7 h-7" />
        </div>
        <div className="text-center mt-5">
          <p className="text-xs font-bold tracking-[0.2em] text-amber-700 uppercase">Emic Travel</p>
          <h1 className="text-2xl font-black text-stone-900 mt-2">Đăng nhập quản trị</h1>
          <p className="text-sm text-stone-500 mt-2">Truy cập hệ thống quản trị nội dung</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Tên đăng nhập</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-bold text-white hover:bg-stone-800 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
};
