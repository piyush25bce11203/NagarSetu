import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onGoToRegister: () => void;
  onOpenAdmin: () => void;
  onOpenStaff: () => void;
  error?: string;
}

export function LoginScreen({ onLogin, onGoToRegister, onOpenAdmin, onOpenStaff, error }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Clear loading if parent signals an auth error
  useEffect(() => {
    if (error) setIsLoading(false);
  }, [error]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    onLogin(email, password);
  };

  return (
    <div className="auth-shell min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center p-6">
      {/* Logo & branding */}
      <motion.div
        className="auth-brand text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100">
          <img
            src="/logo.png"
            alt="NagarSetu Logo"
            className="w-full h-full object-contain p-1"
          />
        </div>
        <h1 className="text-3xl font-bold text-primary">NagarSetu</h1>
        <p className="text-sm text-muted-foreground mt-2">Digital Civic Reporting Platform</p>
      </motion.div>

      {/* Login card */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="auth-card p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Server-side auth error */}
            {error && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2 flex items-center gap-2"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-4 h-4 flex-shrink-0">⚠️</span>
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={localErrors.email ? 'border-red-500 focus-visible:ring-red-400' : ''}
              />
              {localErrors.email && (
                <p className="text-xs text-red-500">{localErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`pr-10 ${localErrors.password ? 'border-red-500 focus-visible:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {localErrors.password && (
                <p className="text-xs text-red-500">{localErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <Separator className="my-5" />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-primary font-medium hover:underline"
            >
              Register here
            </button>
          </p>

          <Separator className="my-4" />

          {/* Admin portal entry */}
          <button
            type="button"
            onClick={onOpenAdmin}
            className="auth-portal-link w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2.5 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            City Admin Portal
            <span className="text-slate-400">→ admin.nagarsetu.gov.in</span>
          </button>

          {/* Staff portal entry */}
          <button
            type="button"
            onClick={onOpenStaff}
            className="auth-portal-link w-full flex items-center justify-center gap-2 text-xs text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg py-2.5 transition-all mt-2"
          >
            <Shield className="w-3.5 h-3.5" />
            Department Staff Portal
            <span className="text-green-400">→ staff.nagarsetu.gov.in</span>
          </button>
        </Card>
      </motion.div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground text-center">
        NagarSetu
      </p>
    </div>
  );
}
