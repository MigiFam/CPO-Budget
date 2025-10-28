import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AuthResponse } from '@cpo/types';

const DEMO_ACCOUNTS = [
  { email: 'director@cpo.app', password: 'Demo!Pass1', role: 'Director' },
  { email: 'finance@cpo.app', password: 'Demo!Pass1', role: 'Finance' },
  { email: 'pm1@cpo.app', password: 'Demo!Pass1', role: 'Project Manager' },
  { email: 'team1@cpo.app', password: 'Demo!Pass1', role: 'Team Member' },
  { email: 'contractor@cpo.app', password: 'Demo!Pass1', role: 'Contractor' },
  { email: 'auditor@cpo.app', password: 'Demo!Pass1', role: 'Auditor' },
];

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<{ success: boolean; data: AuthResponse }>('/api/auth/login', credentials);
      if (!response.data.success) {
        throw new Error('Login failed');
      }
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('✅ Login successful, token received');
      
      // Update Zustand store (this will trigger persist middleware)
      login(data.user, data.token);
      
      // Force a full page reload to ensure clean state
      // This avoids race conditions with React Router navigation
      console.log('🔄 Redirecting to dashboard...');
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    loginMutation.mutate({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@cpo.app"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <CardDescription>Click to auto-populate and login</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={loginMutation.isPending}
                >
                  <span className="font-medium">{account.role}</span>
                  <span className="text-sm text-muted-foreground">{account.email}</span>
                </Button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-2">Test the RBAC system:</p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li>
                  <strong>Director</strong>: Full access to all projects and budgets
                </li>
                <li>
                  <strong>PM</strong>: Manage assigned projects
                </li>
                <li>
                  <strong>Team Member</strong>: View/edit assigned projects
                </li>
                <li>
                  <strong>Finance</strong>: Approve financial documents
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
