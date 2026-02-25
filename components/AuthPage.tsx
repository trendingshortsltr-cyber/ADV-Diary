'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Logo } from './Logo';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
}

export function AuthPage({ onLogin, onRegister }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      onLogin(email, password);
    } else {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      onRegister(email, password);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative font-sans antialiased overflow-hidden"
    >
      {/* Cinematic Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: 'url("/images/login-bg.jpg")',
          opacity: 0.5, // Transparent background as requested
          filter: 'brightness(0.5) contrast(1.1)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/40 via-transparent to-black/80" />

      {/* Content Area */}
      <div className="relative z-10 w-full px-4">
        <Card className="w-full max-w-md mx-auto p-10 glass-card border-white/10 shadow-2xl backdrop-blur-2xl rounded-3xl animate-in zoom-in duration-700">
          <div className="text-center mb-10">
            <Logo className="w-24 h-24 mx-auto mb-6 shadow-2xl rotate-3" />
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">Advocate Diary</h1>
            <p className="text-[10px] font-black text-white tracking-[0.4em] uppercase">Digital Professional Workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">
                Professional Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advocate@example.com"
                className="w-full h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl focus-visible:ring-primary/50 transition-all font-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">
                Secure Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl focus-visible:ring-primary/50 transition-all font-black"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1">
                  Confirm Identity
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl focus-visible:ring-primary/50 transition-all font-black"
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/20 border border-destructive/30 text-white text-xs font-bold rounded-xl animate-shake">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95 mt-4">
              {isLogin ? 'AUTHENTICATE' : 'INITIALIZE ACCOUNT'}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">
              {isLogin ? "NEW PRACTITIONER?" : 'EXISTING MEMBER?'}
            </p>
            <Button
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/5 font-black uppercase text-xs tracking-widest h-12 rounded-xl border border-transparent hover:border-white/10"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              {isLogin ? 'Generate Digital Keys' : 'Return to Portal'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
